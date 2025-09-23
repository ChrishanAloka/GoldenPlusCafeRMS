import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const exportToPDF = () => {
  const input = document.getElementById("receipt-content");

  if (!input) {
    alert("Receipt not found");
    return;
  }

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("receipt.pdf");
  });
};

const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const {
    customerName,
    customerPhone,
    tableNo,
    items,
    totalPrice
  } = order;

  return (
    <div
      className="receipt-modal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: "#f8f9fa",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        padding: "30px"
      }}
    >
      {/* Controls */}
      <div className="text-center mb-4 d-print-none">
        <button onClick={onClose} className="btn btn-secondary me-2">
          Close
        </button>
        <button onClick={exportToPDF} className="btn btn-primary me-2">
          📄 Export PDF
        </button>
        <button
          className="btn btn-success"
          onClick={() => window.print()}
        >
          🖨️ Print Receipt
        </button>
      </div>

      {/* Receipt Content */}
      <div
        id="receipt-content"
        style={{
          maxWidth: "380px",
          margin: "auto",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          fontFamily: "Calibri, sans-serif", // ✅ Set Calibri font globally
          boxShadow: "0 0 10px rgba(0,0,0,0.15)"
        }}
      >
        {/* <h4 className="text-center mb-3">🍽️ <strong>Golden plus cafe and restaurant </strong></h4> */}
        <h3 className="mb-0" style={{ textAlign: "center" }} ><strong>Golden plus</strong></h3>
        <h3 className="mb-1" style={{ textAlign: "center" }}><strong>Cafe and Restaurant</strong></h3>
        <p className="mb-0" style={{ textAlign: "center" }}> 33/C, Naranwala, Gampaha.</p>
        <p className="mb-3" style={{ textAlign: "center" }}> 0770115235 / 0742257227</p>
        <hr />
        {/* <p className="mb-1"><strong>Invoice No:</strong> {order.invoiceNo}</p>
        <p className="mb-1"><strong>Date:</strong> {new Date().toLocaleString()}</p>
        <p className="mb-1"><strong>Customer:</strong> {customerName}</p>
        <p className="mb-1"><strong>Phone:</strong> {customerPhone}</p>
        <p className="mb-1"><strong>Order Type:</strong> {tableNo > 0 ? `Dine In - Table ${tableNo}` : "Takeaway" }</p>
        { (tableNo > 0) ? <></> : (<p><strong>Delivery Type:</strong>  {order.deliveryType}</p>)} */}

        <div style={{ fontSize: "16px", marginBottom: "12px", lineHeight: "1.6" }}>
          {/* Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "90px",  lineHeight: "0", paddingBottom: "4px" }}>
              <strong>Invoice No:</strong>
            </div>
            <div>{order.invoiceNo}</div>
          </div>

          {/* Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "90px", lineHeight: "0", paddingBottom: "4px" }}>
              <strong>Date:</strong>
            </div>
            <div>{new Date().toLocaleString()}</div>
          </div>

          {/* Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "90px",  lineHeight: "0", paddingBottom: "4px" }}>
              <strong>Customer:</strong>
            </div>
            <div>{customerName}</div>
          </div>

          {/* Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "90px",  lineHeight: "0", paddingBottom: "4px" }}>
              <strong>Phone:</strong>
            </div>
            <div>{customerPhone}</div>
          </div>

          {/* Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "90px", lineHeight: "0", paddingBottom: "4px" }}>
              <strong>Order Type:</strong>
            </div>
            <div>{tableNo > 0 ? `Dine In - Table ${tableNo}` : "Takeaway"}</div>
          </div>

          {/* Conditional Row */}
          {tableNo <= 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "90px",  lineHeight: "0", paddingBottom: "4px" }}>
                <strong>Delivery Type:</strong>
              </div>
              <div>{order.deliveryType}</div>
            </div>
          )}
        </div>

        <hr />

        {/* <ul className="mb-3" style={{ listStyle: "none", padding: 0 }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "6px" }} className="list-group-item d-flex justify-content-between">
              <span>{item.name} x {item.quantity} </span>              
              <span className="text-end">{symbol}{item.price?.toFixed(2)}</span>
            </li>
          ))}
          {order.serviceCharge > 0 && (
            <li className="list-group-item d-flex justify-content-between">
              <span>Service Charge ({order.serviceCharge * 100 / order.subtotal?.toFixed(2) || 0}%)</span>
              <span className="text-end">{symbol}{order.serviceCharge?.toFixed(2)}</span>
              
            </li>
          )}

          {order.deliveryCharge > 0 && (
            <li className="list-group-item d-flex justify-content-between">
              <span>Delivery Charge </span>
              <span className="text-end">{symbol}{order.deliveryCharge?.toFixed(2)}</span>
            </li>
          )}
        </ul> */}

        {/* ✅ Replaced list with table for cleaner, aligned display */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
          <thead>
              <th style={{ padding: "4px 0", width: "50%", textAlign: "left" }}> Items</th>
              <th style={{ padding: "4px 0", width: "20%", textAlign: "center" }}> Qty</th>
              <th style={{ padding: "4px 0", width: "30%", textAlign: "right" }}> Amount</th>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: "4px 0", width: "50%", textAlign: "left" }}>
                  {item.name}
                </td>
                <td style={{ padding: "4px 0", width: "20%", textAlign: "center" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "4px 0", width: "30%", textAlign: "right" }}>
                  {symbol}{item.price?.toFixed(2)}
                </td>
              </tr>
            ))}

            {order.serviceCharge > 0 && (
              <tr>
                <td style={{ padding: "4px 0", textAlign: "left" }}>
                  Service Charge ({((order.serviceCharge * 100) / (order.subtotal || 1)).toFixed(2)}%)
                </td>
                <td></td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {symbol}{order.serviceCharge?.toFixed(2)}
                </td>
              </tr>
            )}

            {order.deliveryCharge > 0 && (
              <tr>
                <td style={{ padding: "4px 0", textAlign: "left" }}>
                  Delivery Charge
                </td>
                <td></td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {symbol}{order.deliveryCharge?.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <hr />
        <h5 className="text-end mb-1">Total: {symbol}{totalPrice?.toFixed(2)}</h5>

        {order.payment && (
          <div className="mb-1">
            <p className="mb-1"><strong>Paid via:</strong></p>
            {order.payment.cash > 0 && <p className="mb-1">Cash: {symbol}{order.payment.cash.toFixed(2)}</p>}
            {order.payment.card > 0 && <p className="mb-1">Card: {symbol}{order.payment.card.toFixed(2)}</p>}
            {order.payment.bankTransfer > 0 && (
              <p className="mb-1">Bank Transfer: {symbol}{order.payment.bankTransfer.toFixed(2)}</p>
            )}
            <p className="mb-1"><strong>Total Paid:</strong> {symbol}{order.payment.totalPaid.toFixed(2)}</p>
            <p className="mb-1"><strong>Change Due:</strong> {symbol}{order.payment.changeDue.toFixed(2)}</p>
          </div>
        )}
        <hr />
        <p className="text-center mb-1"> Thank you for your order! </p>
        <p className="text-center mb-1">SOFTWARE BY: RAXWO (Pvt) Ltd.</p>
        <p className="text-center mb-1">CONTACT: 074 357 3333</p>
        <hr />
        {order.deliveryCharge > 0 && (
                  <p>
                    <p>
                      <strong>Delivery Note :</strong>
                    </p>
                    <span >{symbol}{order.deliveryNote}</span>
                  </p>
                )}
      </div>

      {/* Hide everything except receipt when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
