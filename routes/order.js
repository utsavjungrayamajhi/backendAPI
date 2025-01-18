const router = require("express").Router();
const { where, fn, op, col, and, NUMBER } = require("sequelize");
const { Order } = require("../models");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyTokenAndSuper,
  verifyTokenAndAuthorization,
  verifyTokenCustomer,
} = require("./verifyToken");

//create token
router.get("/start-session", (req, res) => {
  try {
    const cId = uuidv4();
    const token = jwt.sign({ customerId: cId }, process.env.JWT_SEC, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token });
  } catch (error) {
    res.status(500).json(error);
  }
});

//create order
router.post("/placeOrder", verifyTokenCustomer, async (req, res) => {
  try {
    const cartItems = req.body;
    console.log(JSON.stringify(cartItems));
    const newOrder = await Order.create({
      customerId: req.customer.customerId,
      foodItems: JSON.stringify(cartItems),
      status: "pending",
      totalPrice: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
    console.log(req.body);

    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get user order
router.get("/find/:cId", verifyToken, async (req, res) => {
  try {
    const ID = req.params.cId;
    const orders = await Order.findOne({
      where: { id: ID },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get all orders
router.get("/", verifyTokenAndSuper, async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
