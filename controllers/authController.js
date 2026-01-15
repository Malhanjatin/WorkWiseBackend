const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utilis/token");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

/* ================= LOGIN ================= */

exports.postLogin = async (req, res) => {
  console.log("login hit");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "validation failed",
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    console.log("🔵 User authenticated, generating tokens...");
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log("🔑 Access Token generated:", accessToken ? "YES" : "NO");
    console.log("🔑 Refresh Token generated:", refreshToken ? "YES" : "NO");
    console.log(
      "🔑 Refresh Token (first 50 chars):",
      refreshToken.substring(0, 50)
    );

    console.log("📝 BEFORE SAVE - user.refreshToken:", user.refreshToken);

    user.refreshToken = refreshToken;
    console.log("📝 AFTER ASSIGNMENT - user.refreshToken:", user.refreshToken);
    console.log("📝 User modified paths:", user.modifiedPaths());
    console.log(
      "📝 Is refreshToken modified?",
      user.isModified("refreshToken")
    );
    user.isActive = true;
    await user.save();
    console.log("💾 SAVE COMPLETED");

    const verifyUser = await User.findById(user._id);
    console.log(
      "verification - refresh token in db",
      verifyUser.refreshToken ? " EXISTS" : "NULL"
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("login successfull cookie set");
    return res.status(200).json({
      message: "login successful",
      user: { email: user.email, id: user._id, role: user.role },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

/* ================= SIGNUP ================= */

exports.postSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(422).json({ message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userRole = email === "jatinmalhan2300@gmail.com" ? "admin" : "user";

    await User.create({
      email,
      password: hashedPassword,
      role: userRole,
    });

    return res.status(201).json({ message: "user created successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

/* ================= DASHBOARD ================= */

exports.getDashBoard = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({
      message: "dashboard data fetched successfully",
      user: { email: user.email, id: user._id },
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

/* ================= REFRESH TOKEN ================= */

exports.refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(403).json({
      message: "refresh token expired or invalid",
    });
  }
};

/* ================= LOGOUT ================= */

exports.logOut = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await User.updateOne(
      { refreshToken: token },
      {
       $unset: { refreshToken: "" } ,
      $set: { isActive: false } 
      }
    );
  }

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "logged out successfully" });
};
