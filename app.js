require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const authRouter = require("./routes/authroute");
const taskRouter = require("./routes/taskroutes");
const cors = require("cors"); 

const cookieParser = require("cookie-parser");

const app = express();
app.use(cors({
  origin: "https://workwiseproductivity.netlify.app", // No trailing slash!
  credentials: true, // Required for the login cookie to work
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// Fix: Use a named parameter with a regex to match everything


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Workwise Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

const PORT = process.env.PORT;
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
