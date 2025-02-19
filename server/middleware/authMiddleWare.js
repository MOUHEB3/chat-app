const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const handler = require("express-async-handler");

const protect = handler(async (req, res, next) => {
    let token = req.headers.authorization?.startsWith("Bearer") 
        ? req.headers.authorization.split(" ")[1] 
        : null;

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});

module.exports = protect;
