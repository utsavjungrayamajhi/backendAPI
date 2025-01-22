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
    const { cart, formData } = req.body;
    const newOrder = await Order.create({
      customerId: req.customer.customerId,
      customerName: formData.fullname,
      hall: formData.hall,
      seat: formData.seat,
      foodItems: JSON.stringify(cart),
      status: "pending",
      totalPrice: cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });

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
router.get("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const { id } = req.params;
  const { delivered } = req.body;

  try {
    const updatedOrder = await Order.update(
      { delivered: delivered },
      { where: { id: id } }
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
