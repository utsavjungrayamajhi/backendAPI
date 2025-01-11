const router = require("express").Router();
const { User } = require("../models");
const CryptoJS = require("crypto-js");
const {
  verifytoken,
  verifyTokenAndAuthorization,
  verifyTokenAndSuper,
} = require("./verifyToken");

//update
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_Ph
    ).toString();
  }

  try {
    await User.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
      plain: true,
    });

    const updatedUser = await User.findByPk(req.params.id);

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json("User has been deleted ");
  } catch (error) {
    res.status(500).json(error);
  }
});

//getuser
router.get("/find", verifyTokenAndSuper, async (req, res) => {
  try {
    const users = await User.findAll();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
