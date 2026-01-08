require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const authRouter = require("./routes/authroute");
const taskRouter = require("./routes/taskroutes");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

const PORT = 3001;
const Mongo_Url =process.env.MONGO_URL;
 
mongoose
  .connect(Mongo_Url)
  .then(() => {
    console.log("connected to mongo");
    app.listen(PORT, () => {
      console.log(`server started at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("error while connection to database", err);
  });
