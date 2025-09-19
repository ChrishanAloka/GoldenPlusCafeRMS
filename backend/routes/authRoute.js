// backend/routes/authRoute.js

const express = require("express");
const router = express.Router();
const { signup, login, getUsers, getSignupKeys, generateSignupKey, deleteSignupKey, updateUserRole, deactivateUser, reactivateUser } = require("../controllers/authController");


const multer = require("multer");
const storage = multer.memoryStorage(); // For buffer upload
const upload = multer({ storage });

const menuController = require("../controllers/menuController");
const { getMenus, deleteMenu } = require("../controllers/menuController");

const authMiddleware = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");
// ✅ Add this line:
const orderController = require("../controllers/orderController");
const {getCustomerByPhone, updateOrderStatus} = require("../controllers/orderController");
const { getMonthlyReport } = require("../controllers/reportController");

const { getBills, addBill, updateBill, deleteBill } = require("../controllers/kitchenBillController");

const authController = require("../controllers/authController");

const forgotPasswordController = require("../controllers/forgotPasswordController");

const employeeController = require("../controllers/employeeController");

const currencyController = require("../controllers/currencyController");

const attendanceController = require("../controllers/attendanceController");

const supplierController = require("../controllers/supplierController");
const expenseController = require("../controllers/expenseController");
const salaryController = require("../controllers/salaryController");

const kitchenRequestController = require("../controllers/kitchenRequestController");

const adminController = require("../controllers/adminController");

const notificationController = require("../controllers/notificationController");

const serviceChargeController = require("../controllers/serviceChargeController");

const deliveryChargeController = require("../controllers/deliveryChargeController");

const driverController = require("../controllers/driverController");


// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route - Admin only
router.get("/users", authMiddleware(["admin"]), getUsers); // ✅ Now protected
// Protected routes - Admin only
router.get("/signup-keys", authMiddleware(["admin"]), getSignupKeys);
router.post("/generate-key", authMiddleware(["admin"]), generateSignupKey);
router.delete("/signup-key/:id", authMiddleware(["admin"]), deleteSignupKey);

// Role management
router.put("/user/:id/role", authMiddleware(["admin"]), updateUserRole);
router.put("/user/:id/deactivate", authMiddleware(["admin"]), deactivateUser);
router.put("/user/reactivate/:id", authMiddleware(["admin"]), reactivateUser);

// Admin & Kitchen can manage menus
// backend/routes/authRoute.js
router.get("/menus", authMiddleware(["admin", "kitchen", "cashier"]), getMenus);
// router.post("/menu", authMiddleware(["admin", "kitchen"]), upload.single("image"), createMenu);
router.post("/menu", authMiddleware(["admin", "kitchen"]), upload.single("image"), menuController.createMenu);
router.put("/menu/:id", authMiddleware(["admin", "kitchen"]), upload.single("image"), menuController.updateMenu);
router.delete("/menu/:id", authMiddleware(["admin", "kitchen"]), deleteMenu);

// backend/routes/authRoute.js
// ✅ New Order Routes
router.post("/order", authMiddleware(["cashier"]), orderController.createOrder); // Now defined
// backend/routes/authRoute.js

router.get("/order/:id", authMiddleware(["admin", "cashier"]), orderController.getOrderById);

router.get("/orders", authMiddleware(["cashier", "kitchen"]), orderController.getOrderHistory);
router.put("/order/:id/status", authMiddleware(["kitchen", "admin"]), orderController.updateOrderStatus);
router.get("/orders/export/excel", authMiddleware(["admin", "cashier", "kitchen"]), orderController.exportOrdersToExcel);

router.get("/customer", authMiddleware(["cashier"]), getCustomerByPhone);

router.put("/order/:id/status", authMiddleware(["kitchen", "admin"]), updateOrderStatus);

router.get("/admin/service-charge", authMiddleware(["admin", "cashier"]), serviceChargeController.getServiceCharge);
router.put("/admin/service-charge", authMiddleware(["admin"]), serviceChargeController.updateServiceCharge);

router.get("/admin/delivery-charge", authMiddleware(["admin", "cashier"]), deliveryChargeController.getDeliveryCharge);
router.put("/admin/delivery-charge", authMiddleware(["admin"]), deliveryChargeController.updateDeliveryCharge);
router.get("/cashier/takeaway-orders", authMiddleware(["admin", "cashier"]), orderController.getCashierTakeawayOrders);

router.get("/drivers", authMiddleware(["admin", "cashier"]), orderController.getDrivers);
// Update delivery status only for Delivery Service orders
router.put("/order/:id/delivery-status", authMiddleware(["admin", "cashier"]), orderController.updateDeliveryStatus);

// GET /kitchen/bills → list all
router.get("/kitchen/bills", authMiddleware(["admin", "kitchen"]), getBills);
// POST /kitchen/bill → add new
router.post("/kitchen/bill", authMiddleware(["admin", "kitchen"]), addBill);
// PUT /kitchen/bill/:id → update existing
router.put("/kitchen/bill/:id", authMiddleware(["admin", "kitchen"]), updateBill);
// DELETE /kitchen/bill/:id → remove
router.delete("/kitchen/bill/:id", authMiddleware(["admin", "kitchen"]), deleteBill);

// Kitchen Requests - For Kitchen Staff
router.post("/kitchen/request", authMiddleware(["kitchen"]), kitchenRequestController.submitRequest);
router.get("/kitchen/my-requests", authMiddleware(["kitchen"]), kitchenRequestController.getMyRequests);

// Kitchen Requests - For Admin
router.get("/kitchen/requests", authMiddleware(["admin"]), kitchenRequestController.getAllRequests);
router.put("/kitchen/request/:id/status", authMiddleware(["admin"]), kitchenRequestController.updateRequestStatus);

router.get("/report/monthly", authMiddleware(["kitchen", "admin"]), getMonthlyReport);

router.post("/forgot-password", forgotPasswordController.forgotPassword);
router.post("/reset-password/:token", forgotPasswordController.resetPassword);

router.post("/verify-reset-key", authController.verifyResetKey);
router.post("/reset-password", authController.resetPassword);

// Register & view employees
router.post("/employee/register", authMiddleware(["admin"]), employeeController.registerEmployee);
router.get("/employees", authMiddleware(["admin", "cashier", "kitchen"]), employeeController.getAllEmployees);
router.get("/employee/:id", authMiddleware(["admin"]), employeeController.getEmployeeById);
router.put("/employee/:id", authMiddleware(["admin"]), employeeController.updateEmployee);
router.delete("/employee/:id", authMiddleware(["admin"]), employeeController.deleteEmployee);
router.get("/employees/next-id", authMiddleware(["admin"]), employeeController.getNextId);

// Currency Settings
router.get("/settings/currency", authMiddleware(["admin"]), currencyController.getCurrency);
router.put("/settings/currency", authMiddleware(["admin"]), currencyController.updateCurrency);

// Suppliers
router.post("/supplier/register", authMiddleware(["admin"]), supplierController.registerSupplier);
router.put("/supplier/:id", authMiddleware(["admin"]), supplierController.editSupplier);
router.delete("/supplier/:id", authMiddleware(["admin"]), supplierController.deleteSupplier);
router.get("/suppliers", authMiddleware(["admin"]), supplierController.getAllSuppliers);

// Expenses
router.post("/expense/add", authMiddleware(["admin"]), expenseController.addExpense);
router.get("/expenses", authMiddleware(["admin"]), expenseController.getAllExpenses);
router.put("/expense/:id", authMiddleware(["admin", "cashier"]), expenseController.updateExpense);
router.delete("/expense/:id", authMiddleware(["admin", "cashier"]), expenseController.deleteExpense);

// Salaries
router.post("/salary/add", authMiddleware(["admin"]), salaryController.addSalary);
router.get("/salaries", authMiddleware(["admin"]), salaryController.getAllSalaries);

router.get("/admin/summary", authMiddleware(["admin"]), adminController.getAdminSummary);
router.get("/admin/trend/monthly", authMiddleware(["admin"]), adminController.getMonthlyTrend);
router.get("/admin/expenses", authMiddleware(["admin"]), adminController.getExpenseSummary);

// Attendance Routes
router.post("/attendance/punch", authMiddleware(["admin", "cashier", "kitchen"]), attendanceController.recordPunch);
router.get("/attendance/summary", authMiddleware(["admin", "cashier", "kitchen"]), attendanceController.getSummary);
router.get("/admin/attendance/monthly-summary", authMiddleware(["admin"]), attendanceController.getMonthlySummary);

router.get("/notifications", authMiddleware(["admin", "cashier", "kitchen"]), notificationController.getNotifications);
router.post("/notifications/send", authMiddleware(["admin", "cashier", "kitchen"]), notificationController.sendNotification);
router.post("/notifications/mark-read", authMiddleware(["admin", "cashier", "kitchen"]), notificationController.markAsRead);
router.post("/notifications/mark-all-read", authMiddleware(["admin", "cashier", "kitchen"]), notificationController.markAllAsRead);

router.get("/drivers", authMiddleware(["admin", "cashier"]), driverController.getDrivers);
router.post("/drivers", authMiddleware(["admin", "cashier"]), driverController.registerDriver);
router.put("/drivers/:id", authMiddleware(["admin", "cashier"]), driverController.updateDriver);
router.delete("/drivers/:id", authMiddleware(["admin", "cashier"]), driverController.deleteDriver);

module.exports = router;