import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./CashierOrderHistory.css";



if (!window.printElement) {
  window.printElement = (element) => {
    const originalContents = document.body.innerHTML;
    const printContent = element.outerHTML;

    document.body.innerHTML = `
      <style>
        body { font-family: monospace; max-width: 400px; margin: auto; }
        h3, p, li { display: block; width: 100%; text-align: left; }
      </style>
      ${printContent}
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
}

const CashierOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: ""
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    // Get start and end of selected date
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    // Set time to start & end of day
    start.setHours(0, 0, 0, 0);     // 00:00:00
    end.setHours(23, 59, 59, 999); // 23:59:59

    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", start);
    if (filters.endDate) params.append("endDate", end);
    if (filters.status) params.append("status", filters.status);

    try {
      const res = await axios.get(
        `https://rms-6one.onrender.com/api/auth/orders?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err.response?.data || err.message);
      alert("Failed to load order history");
    }
  };

  const exportToExcel = () => {
    import("xlsx").then((XLSX) => {
      const worksheetData = orders.map((order) => ({
        Date: new Date(order.date).toLocaleString(),
        Customer: order.customerName,
        Table: order.tableNo,
        Status: order.status,
        Total: order.totalPrice?.toFixed(2)
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, "cashier_orders.xlsx");
    });
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const exportToPDF = () => {
    const input = document.getElementById("order-table");
    if (!input) {
      alert("Could not find order table");
      return;
    }

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("cashier_orders.pdf");
    });
  };

  

// 🧾 Generate Receipt & Print/Export
const generateReceipt = (order) => {
  const symbol = localStorage.getItem("currencySymbol") || "$";

  // Create a container div
  const container = document.createElement("div");
  container.id = "dynamic-receipt";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.zIndex = "10000";
  container.style.background = "#fff";
  container.style.padding = "20px";
  container.style.fontFamily = "monospace";
  container.style.maxWidth = "380px";
  container.style.boxShadow = "0 0 10px rgba(0,0,0,0.25)";
  container.style.border = "1px solid #ccc";
  container.style.borderRadius = "10px";
  container.style.margin = "auto";
  container.style.right = "0";

  container.innerHTML = `
    <h4 style="text-align:center;">🍽️ <strong>RMS Restaurant</strong></h4>
    <p><strong>Invoice No:</strong> ${order.invoiceNo || "-"}</p>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Customer:</strong> ${order.customerName}</p>
    <p><strong>Phone:</strong> ${order.customerPhone || "-"}</p>
    <p><strong>Order Type:</strong> ${order.tableNo > 0 ? `Dine In - ${order.tableNo}` : "Takeaway" }</p>
    ${order.tableNo > 0 ? `<p></p>` :`<p><strong>Delivery Type:</strong>  ${order.deliveryType}</p>`}
    <hr />
    <ul style="list-style:none; padding:0;">
      ${order.items.map(item => `
        <li class="list-group-item d-flex justify-content-between">
          <span>${item.name} x${item.quantity} </span>
          <span class="text-end">   ${symbol}${item.price?.toFixed(2)}</span>
        </li>
      `).join("")}
      ${order.serviceCharge != 0 ?  (
        `<li class="list-group-item d-flex justify-content-between">
          <span>Service Charge (${order.serviceCharge * 100 / order.subtotal?.toFixed(2) || 0}%)</span>
          <span class="text-end">${symbol}${order.serviceCharge?.toFixed(2)}</span>   
        </li>
      `) : `<li></li>` }
      ${order.deliveryCharge != 0 ?  (
        `<li class="list-group-item d-flex justify-content-between">
          <span>Delivery Charge </span>
          <span class="text-end">${symbol}${order.deliveryCharge?.toFixed(2)}</span>
        </li>
      `) : `<li></li>` }
    </ul>           
    <hr />
    <h5 style="text-align:right;">Total: ${symbol}${order.totalPrice?.toFixed(2)}</h5>

    ${order.payment ? `
      <p><strong>Paid via:</strong></p>
      ${order.payment.cash > 0 ? `<p>Cash: ${symbol}${order.payment.cash.toFixed(2)}</p>` : ""}
      ${order.payment.card > 0 ? `<p>Card: ${symbol}${order.payment.card.toFixed(2)}</p>` : ""}
      ${order.payment.bankTransfer > 0 ? `<p>Bank Transfer: ${symbol}${order.payment.bankTransfer.toFixed(2)}</p>` : ""}
      <p><strong>Total Paid:</strong> ${symbol}${order.payment.totalPaid?.toFixed(2)}</p>
      <p><strong>Change Due:</strong> ${symbol}${order.payment.changeDue?.toFixed(2)}</p>
    ` : ""}

    <p style="text-align:center; margin-top:20px;">✨ Thank you for your visit! ✨</p>
  `;

  document.body.appendChild(container);

  // Export to PDF option (you can call this on a button as well)
  const exportPDF = () => {
    html2canvas(container).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("receipt.pdf");
    });
  };

  // Print only receipt content
  const printReceipt = () => {
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = container.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // Prompt options (could be buttons too)
  const proceed = window.confirm("Do you want to print the receipt?");
  if (proceed) {
    printReceipt();
  } else {
    exportPDF();
  }

  // Optional: Remove the container after export
  setTimeout(() => {
    container.remove();
  }, 3000);
};




  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mobile-scroll-container container-fluid px-3">
      <h2 className="mb-4 text-primary border-bottom pb-2">🧾 Cashier Order History</h2>

      {/* Filters & Actions */}
      <div className="row g-3 align-items-end mb-4" style={{ overflowX: "auto", width: "100%" }}>
        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            name="startDate"
            type="date"
            className="form-control"
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            name="endDate"
            type="date"
            className="form-control"
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button className="btn btn-primary w-100" onClick={fetchOrders}>Apply</button>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mb-3">
        <button className="btn btn-success" onClick={exportToExcel}>
          📤 Export Excel
        </button>
        <button className="btn btn-danger" onClick={exportToPDF}>
          📄 Export PDF
        </button>
      </div>

      {/* Order Table */}
      {orders.length === 0 ? (
        <p className="text-muted">No orders found.</p>
      ) : (
        <div
          id="order-table"
          className="shadow-sm border rounded"
          style={{
            overflowX: "auto",
            width: "100%"
          }}
        >
          <table className="table table-hover align-middle table-bordered mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Table No/ Takeaway</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>{order.customerName}</td>
                  <td>{order.tableNo > 0 ? `Table ${order.tableNo}` : `Takeaway`}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "Ready"
                          ? "bg-success"
                          : order.status === "Processing"
                          ? "bg-primary"
                          : order.status === "Completed"
                          ? "bg-secondary"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <ul className="mb-0 small list-unstyled">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{symbol}{order.totalPrice?.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => generateReceipt(order)}
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashierOrderHistory;
