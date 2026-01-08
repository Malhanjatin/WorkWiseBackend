const jwt = require("jsonwebtoken");

/**
 * Generate Access Token
 * @param {Object} user - Mongoose user document
 */
exports.generateAccessToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), email: user.email }, // <-- removed () after user.email
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m", // fallback if env is missing
    }
  );

/**
 * Generate Refresh Token
 * @param {Object} user - Mongoose user document
 */
exports.generateRefreshToken = (user) =>
  jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // fallback
    }
  );
