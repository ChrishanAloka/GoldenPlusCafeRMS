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
          fontFamily: "monospace",
          boxShadow: "0 0 10px rgba(0,0,0,0.15)"
        }}
      >
        <h4 className="text-center mb-3">🍽️ <strong>RMS Restaurant</strong></h4>
        <p><strong>Invoice No:</strong> {order.invoiceNo}</p>
        <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Customer:</strong> {customerName}</p>
        <p><strong>Phone:</strong> {customerPhone}</p>
        <p><strong>Order Type:</strong> {tableNo > 0 ? `Dine In - Table ${tableNo}` : "Takeaway" }</p>
        { (tableNo > 0) ? <></> : (<p><strong>Delivery Type:</strong>  {order.deliveryType}</p>)}

        <hr />

        <ul className="mb-3" style={{ listStyle: "none", padding: 0 }}>
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
        </ul>

        <hr />
        <h5 className="text-end">Total: {symbol}{totalPrice?.toFixed(2)}</h5>

        {order.payment && (
          <div className="mt-3">
            <p><strong>Paid via:</strong></p>
            {order.payment.cash > 0 && <p>Cash: {symbol}{order.payment.cash.toFixed(2)}</p>}
            {order.payment.card > 0 && <p>Card: {symbol}{order.payment.card.toFixed(2)}</p>}
            {order.payment.bankTransfer > 0 && (
              <p>Bank Transfer: {symbol}{order.payment.bankTransfer.toFixed(2)}</p>
            )}
            <p><strong>Total Paid:</strong> {symbol}{order.payment.totalPaid.toFixed(2)}</p>
            <p><strong>Change Due:</strong> {symbol}{order.payment.changeDue.toFixed(2)}</p>
          </div>
        )}

        <p className="text-center mt-4">✨ Thank you for your order! ✨</p>
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
