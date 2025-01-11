const router = require("express").Router();
const { where, fn, op, col, and, NUMBER } = require("sequelize");
const { Payment } = require("../models");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyTokenAndSuper,
  verifyTokenAndAuthorization,
  verifyTokenCustomer,
} = require("./verifyToken");

//get all orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findAll();
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get monthly stats
router.get("/stats", verifyTokenAndSuper, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Payment.findAll({
      attributes: [
        [fn("MONTH", col("createdAt"), "month")],
        [fn("SUM", col("totalPrice")), "amount"],
      ],
      where: {
        createdAt: {
          [op.gte]: previousMonth,
        },
      },
      group: [fn("MONTH", col("createdAt"))],
      raw: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
