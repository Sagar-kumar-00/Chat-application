const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;
  // console.log('pro',req.headers.authorization)

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decodes token id
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error("❌ User not found for token ID:", decoded.id);
        return res.status(401).send({ 
          success: false, 
          message: "User not found - invalid token" 
        });
      }

      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error.message);
      return res.status(401).send("Not authorized, token failed");
    }
  }

  if (!token) {
    return res.status(401).send("Not authorized, no token provided");
  }
};

module.exports = { protect };
