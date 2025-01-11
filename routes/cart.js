const router = require("express").Router();
const { where } = require("sequelize");
const { Cart } = require("../models");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyTokenAndSuper,
  verifyTokenAndAuthorization,
  verifyTokenCustomer,
} = require("./verifyToken");

//create token
// router.post("/start-session", (req, res) => {
//   const cId = uuidv4();
//   const token = jwt.sign({ customerId: cId }, process.env.JWT_SEC, {
//     expiresIn: "1h",
//   });

//   res.cookie("token", token, { httpOnly: true });
//   res.status(200).json(token);
// });

//create cart, add food to cart
router.post("/add", verifyTokenCustomer, async (req, res) => {
  if (!req.cookies.token) {
    const token = jwt.sign({ customerId: uuidv4() }, process.env.JWT_SEC, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    //res.status(200).json(token);
  }

  try {
    const newCart = await Cart.create({
      customerId: req.cookies.token,
      itemId: req.body.itemId,
      quantity: req.body.quantity,
      status: "active",
    });

    res.status(200).json(newCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update
router.put("/:id", verifyTokenCustomer, async (req, res) => {
  try {
    await Cart.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
      plain: true,
    });

    const updatedCart = await User.findByPk(req.params.id);

    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete foodItem
router.delete("/:id", verifyTokenCustomer, async (req, res) => {
  try {
    await Cart.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json("FoodItem has been deleted ");
  } catch (error) {
    res.status(500).json(error);
  }
});

// get user cart
router.get("/find/:cId", verifyToken, async (req, res) => {
  try {
    const foodItem = await FoodItem.findOne({
      where: { customerId: req.params.cId },
    });

    res.status(200).json(foodItem);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
