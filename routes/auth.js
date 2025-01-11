const router = require("express").Router();
const { User } = require("../models");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndSuper,
} = require("./verifyToken");

router.post("/register", verifyTokenAndSuper, async (req, res) => {
  //Register
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_Ph
    ).toString(),
    isSuper: req.body.isSuper || false,
  };

  try {
    const savedUser = await User.create(newUser);
    return res.status(201).json(savedUser);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.status(401).json("User not found !");
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_Ph
    );

    const pass = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (pass !== req.body.password) {
      return res.status(500).json("Incorrect Password !");
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        isSuper: user.isSuper,
      },
      process.env.JWT_SEC,
      { expiresIn: "1d" }
    );

    const { password, ...others } = user.get();

    return res.status(200).json({ ...others, accessToken });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
