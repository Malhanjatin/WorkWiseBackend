const express = require("express");
const authRouter = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/isAuth");
const authController = require("../controllers/authController");

authRouter.post(
  "/signup",
  [
    body("email").isEmail().withMessage("please enter a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 chaacter long")
      .matches(/\d/)
      .withMessage("password must contain a number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("password must contain a special character")
      .matches(/[A-Z]/)
      .withMessage("password must contain an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("password must contain a lowercase letterr"),
    body("confirmPassword").custom((value, { req }) => {
      if (!req.body.password) {
        throw new Error("password is required to confrim");
      }
      if (value !== req.body.password) {
        throw new Error("passwords have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

authRouter.post(
  "/login",
  [body("email").isEmail().withMessage("please enter a valid email")],
  authController.postLogin
);

authRouter.get("/dashboard", isAuth, authController.getDashBoard);
authRouter.post("/refresh-token", authController.refreshAccessToken);
authRouter.post("/logout", authController.logOut);

module.exports = authRouter;
