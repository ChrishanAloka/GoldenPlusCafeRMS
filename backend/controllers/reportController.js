const Order = require("../models/Order");
const Expense = require("../models/Expense");
const KitchenBill = require("../models/KitchenBill");
const Salary = require("../models/Salary");

// GET /api/auth/report/monthly?month=7&year=2024
exports.getMonthlyReport = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month - 1, 31);

    // Fetch data
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
    const supplierExpenses = await Expense.find({ date: { $gte: start, $lte: end } });
    const kitchenBills = await KitchenBill.find({ date: { $gte: start, $lte: end } });
    const salaries = await Salary.find({ date: { $gte: start, $lte: end } });

    // Helper: group by day
    const groupByDay = (data, valueKey = "amount", dateKey = "createdAt") => {
      const result = {};
      data.forEach((item) => {
        const date = new Date(item[dateKey]).toISOString().split("T")[0];
        result[date] = (result[date] || 0) + item[valueKey];
      });
      return result;
    };

    const monthlyIncome = groupByDay(orders, "totalPrice", "createdAt");
    const monthlySupplierExpenses = groupByDay(supplierExpenses, "amount", "date");
    const monthlyBills = groupByDay(kitchenBills, "amount", "date");
    const monthlySalaries = groupByDay(salaries, "total", "date");

    res.json({
      monthlyIncome,
      monthlySupplierExpenses,
      monthlyBills,
      monthlySalaries
    });
  } catch (err) {
    console.error("Failed to generate report:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};