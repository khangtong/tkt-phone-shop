import path from "path";
import express from "express";
import morgan from "morgan";
import authRoute from "./routes/authRoute.js";

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoute);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
