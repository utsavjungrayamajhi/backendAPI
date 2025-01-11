const router = require("express").Router();
const { where } = require("sequelize");
const { FoodItem } = require("../models");
const {
  verifyToken,
  verifyTokenAndSuper,
  verifyTokenAndAuthorization,
} = require("./verifyToken");

//create fooditem
router.post("/", verifyTokenAndSuper, async (req, res) => {
  try {
    console.log(req.body);
    const newFoodItem = await FoodItem.create(req.body);
    res.status(200).json(newFoodItem);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete foodItem
router.delete("/:foodId", verifyTokenAndSuper, async (req, res) => {
  try {
    await FoodItem.destroy({
      where: {
        id: req.params.foodId,
      },
    });

    res.status(200).json("FoodItem has been deleted ");
  } catch (error) {
    res.status(500).json(error);
  }
});

//get foodItem
router.get("/find/:id", async (req, res) => {
  try {
    const foodItem = await FoodItem.findByPk(req.params.id);

    res.status(200).json(foodItem);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get foodItems
router.get("/", async (req, res) => {
  const qnew = req.query.new;
  const qcategory = req.query.category;
  try {
    let foodItems;
    if (qnew) {
      foodItems = await FoodItem.findAll({
        order: [["createdAt", "DESC"]],
      });
    } else if (qcategory) {
      foodItems = await FoodItem.findAll({
        where: { category: qcategory },
        order: [["createdAt", "DESC"]],
      });
    } else {
      foodItems = await FoodItem.findAll();
    }
    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
