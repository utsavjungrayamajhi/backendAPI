const router = require("express").Router();
const { where } = require("sequelize");
const { FoodItem } = require("../models");
const {
  verifyToken,
  verifyTokenAndSuper,
  verifyTokenAndAuthorization,
} = require("./verifyToken");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images in this directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG are allowed"));
    }
  },
});

router.post(
  "/add",
  verifyTokenAndSuper,
  upload.single("img"),
  async (req, res) => {
    try {
      const { name, price, category } = req.body;
      parsedPrice = parseInt(price);
      const img = req.file ? `uploads/${req.file.filename}` : null;
      const foodDetails = await FoodItem.create({
        name,
        price: parsedPrice,
        category,
        img,
      });
      res.status(201).json(foodDetails);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const foodItem = await FoodItem.findByPk(req.params.id);
    let newImgPath = null;
    if (req.file) {
      newImgPath = `uploads/${req.file.filename}`;
      if (
        foodItem.img &&
        fs.existsSync(path.resolve(__dirname, "..", foodItem.img))
      ) {
        fs.unlinkSync(path.resolve(__dirname, "..", foodItem.img));
      }
    }

    const updatedData = {
      ...req.body,
      img: newImgPath || foodItem.img, // Use new image path if uploaded, else keep the old one
    };

    await FoodItem.update(updatedData, {
      where: { id: req.params.id },
    });

    //Fetch the updated food item

    const updatedFoodItem = await FoodItem.findByPk(req.params.id);

    res.status(200).json(updatedFoodItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete foodItem
router.delete("/:foodId", verifyTokenAndSuper, async (req, res) => {
  try {
    const foodItem = await FoodItem.findByPk(req.params.foodId);
    const imgPath = foodItem.img
      ? path.resolve(__dirname, "..", foodItem.img)
      : null;
    if (imgPath && fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }

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
    const parsedId = parseInt(req.params.id);
    const foodItem = await FoodItem.findByPk(parsedId);
    const foodWithImageURLs = {
      ...foodItem.toJSON(),
      img: foodItem.img ? `http://localhost:5000/${foodItem.img}` : null,
    };
    res.status(200).json(foodWithImageURLs);
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

    const foodWithImageURLs = foodItems.map((food) => ({
      ...food.toJSON(),
      img: food.img ? `http://localhost:5000/${food.img}` : null,
    }));

    res.status(200).json(foodWithImageURLs);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
