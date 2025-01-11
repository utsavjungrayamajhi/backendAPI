const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Token is not valid!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenCustomer = (req, res, next) => {
  const tokenHeader = req.headers.token;
  if (tokenHeader) {
    const token = tokenHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, customer) => {
      if (err) res.status(403).json("Token is invalid");
      req.customer = customer;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id.toString() === req.params.id || req.user.isSuper) {
      next();
    } else {
      res.status(403).json("You are not allowed!");
    }
  });
};

const verifyTokenAndSuper = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isSuper) {
      next();
    } else {
      res.status(403).json("You are not allowed!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenCustomer,
  verifyTokenAndAuthorization,
  verifyTokenAndSuper,
};
