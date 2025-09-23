import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalOtherIncome: 0, // ✅ NEW
    totalSupplierExpenses: 0,
    totalBills: 0,
    totalSalaries: 0,
    totalOtherExpenses: 0, // ✅ NEW
    totalCost: 0,
    netProfit: 0,
    totalOrders: 0,
    totalOrdersIncome: 0,
    totalOrdersNetIncome: 0,
    statusCounts: {},
    paymentBreakdown: { cash: 0, cashdue: 0, card: 0, bank: 0 },
    topMenus: []
  });

  const [filterType, setFilterType] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    fetchSummary();
  }, [filterType, customStart, customEnd]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      let payload = {};

      switch (filterType) {
        case "today":
          const today = new Date();
          payload.startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
          payload.endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
          break;

        case "thisWeek":
          const now = new Date();
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          payload.startDate = firstDayOfWeek.toISOString();
          payload.endDate = new Date().toISOString();
          break;

        case "thisMonth":
          const todayMonth = new Date();
          const firstOfMonth = new Date(todayMonth.getFullYear(), todayMonth.getMonth(), 1);
          const lastOfMonth = new Date(todayMonth.getFullYear(), todayMonth.getMonth() + 1, 0);
          payload.startDate = firstOfMonth.toISOString();
          payload.endDate = lastOfMonth.toISOString();
          break;

        case "custom":
          if (!customStart || !customEnd) return;
          payload.startDate = new Date(customStart).toISOString();
          payload.endDate = new Date(customEnd).toISOString();
          break;

        default:
          break;
      }

      const res = await axios.get("https://goldenpluscaferms.onrender.com/api/auth/admin/summary", {
        headers: { Authorization: `Bearer ${token}` },
        params: payload
      });

      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err.message);
      alert("Failed to load admin summary");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  // ✅ Cost Breakdown Chart Data
  const costChartData = {
    labels: ["Supplier Expenses", "Utility Bills", "Staff Salaries", "Other Expenses"], // ✅ UPDATED
    datasets: [{
      label: "Expenses",
      data: [
        summary.totalSupplierExpenses,
        summary.totalBills,
        summary.totalSalaries,
        summary.totalOtherExpenses // ✅ NEW
      ],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF9F40"] // ✅ ADDED Orange for Other Expenses
    }]
  };

  // ✅ Order Status Pie Chart
  const statusChartData = {
    labels: Object.keys(summary.statusCounts),
    datasets: [{
      label: "Order Status",
       data: Object.values(summary.statusCounts),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      hoverOffset: 4
    }]
  };

  // ✅ Payment Method Doughnut Chart
  const paymentChartData = {
    labels: ["Cash", "Card", "Bank Transfer"],
    datasets: [{
      label: "Payment Methods",
       data: [
        (summary.paymentBreakdown.cash - summary.paymentBreakdown.cashdue),
        summary.paymentBreakdown.card,
        summary.paymentBreakdown.bank
      ],
      backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
    }]
  };

  // ✅ Top Menus Bar Chart Data
  const topMenuData = {
    labels: summary.topMenus.map(m => m.name),
    datasets: [{
      label: "Units Sold",
       data: summary.topMenus.map(m => m.count),
      backgroundColor: "#4CAF50"
    }]
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="container my-4">
    <h2 className="mb-4 text-primary fw-bold">Admin Dashboard</h2>

    {/* Filter Panel */}
    <div className="card shadow-sm p-3 mb-4">
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label fw-semibold">Select Timeframe</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {filterType === "custom" && (
          <>
            <div className="col-md-3">
              <label className="form-label fw-semibold">From</label>
              <input
                type="date"
                className="form-control"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">To</label>
              <input
                type="date"
                className="form-control"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="col-md-3">
          <button onClick={fetchSummary} className="btn btn-outline-primary w-100">
            🔍 Apply Filter
          </button>
        </div>
      </div>
    </div>

    {/* Summary Cards */}
    <div className="row g-3 mb-4">
      {[
        { label: "Total Orders", value: summary.totalOrders, color: "primary", icon: "🛒" },
        { label: "Orders Income / Orders Net Income", value: 
          `${symbol}${formatCurrency(summary.totalOrdersIncome)} / ${symbol}${formatCurrency(summary.totalOrdersNetIncome)}`,
          // (
          //   <>
          //     {symbol}{formatCurrency(summary.totalOrdersIncome)}
          //     <br />
          //     Net {symbol}{formatCurrency(summary.totalOrdersNetIncome)}
          //   </>
          // ), 
          color: "primary", icon: "🛒" },
        { label: "Other Income", value: `${symbol}${formatCurrency(summary.totalOtherIncome)}`, color: "success", icon: "🎁"}, // ✅ NEW
        { label: "Other Expenses", value: `${symbol}${formatCurrency(summary.totalOtherExpenses)}`, color: "danger", icon: "🔧"}, // ✅ NEW
        
        { label: "Total Income", value: `${symbol}${formatCurrency(summary.totalIncome)}`, color: "success", icon: "💰" },
        { label: "Total Cost", value: `${symbol}${formatCurrency(summary.totalCost)}`, color: "danger", icon: "📉" },
        {
          label: "Net Profit",
          value: `${summary.netProfit >= 0 ? "+" : "-"}${symbol}${formatCurrency(Math.abs(summary.netProfit))}`,
          color: summary.netProfit >= 0 ? "info" : "warning",
          icon: summary.netProfit >= 0 ? "📈" : "⚠️",
        }
      ].map((card, idx) => (
        <div className="col-md-3" key={idx}>
          <div className={`card bg-${card.color} text-white shadow-sm h-100`}>
            <div className="card-body text-center">
              <div className="fs-3">{card.icon}</div>
              <h6 className="mt-2 fw-bold">{card.label}</h6>
              <h4 className="fw-bold">{card.value}</h4>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Chart Section */}
    <div className="row g-4 mb-4">
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="fw-bold text-center mb-3">📦 Order Status</h6>
            <Doughnut data={statusChartData} />
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="fw-bold text-center mb-3">💳 Payment Methods</h6>
            <Doughnut data={paymentChartData} />
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="fw-bold text-center mb-3">📊 Cost Breakdown</h6>
            <Doughnut data={costChartData} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Tables Section */}
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="fw-bold mb-3">🍽️ Top Ordered Menu Items</h6>
            <ul className="list-group">
              {summary.topMenus.length === 0 && (
                <li className="list-group-item text-muted">No data</li>
              )}
              {summary.topMenus.slice(0, 10).map((item, idx) => (
                <li
                  key={idx}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {item.name}
                  <span className="badge bg-dark">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="fw-bold mb-3">📌 Order Summary</h6>
            <table className="table table-sm table-hover table-striped">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.statusCounts).map(([status, count], idx) => (
                  <tr key={idx}>
                    <td>{status}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="fw-bold mb-3">💸 Payment Summary</h6>
            <table className="table table-sm table-hover table-striped">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cash", (summary.paymentBreakdown.cash - summary.paymentBreakdown.cashdue)],
                  // ["ChangeDue", summary.paymentBreakdown.cashdue],
                  ["Card", summary.paymentBreakdown.card],
                  ["Bank Transfer", summary.paymentBreakdown.bank],
                ].map(([label, val], idx) => (
                  <tr key={idx}>
                    <td>{label}</td>
                    <td>{symbol}{formatCurrency(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default AdminDashboard;