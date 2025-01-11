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
    const { cartItems } = req.body;
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
    console.log(newOrder);

    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update
router.put("/:id", verifyTokenAndSuper, async (req, res) => {
  try {
    await Order.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
      plain: true,
    });

    const updatedOrder = await Order.findByPk(req.params.id);

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete foodItem
router.delete("/:id", verifyTokenAndSuper, async (req, res) => {
  try {
    await Order.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json("FoodItem has been deleted ");
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

//get monthly stats
router.get("/stats", verifyTokenAndSuper, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.findAll({
      attributes: [
        [fn("MONTH", col("createdAt"), "month")],
        [fn("SUM", col("totalPrice")), "total"],
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
