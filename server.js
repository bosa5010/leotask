import express from "express";
import dotenv from "dotenv";
import userRouter from "./routers/userRouter.js";
import teamRouter from "./routers/teamRouter.js";
import taskThemeRouter from "./routers/taskThemeRouter.js";
// import db from "./config/db.js";
import mongoose from "mongoose";
import cors from "cors";
import taskModelRouter from "./routers/taskModelRouter.js";
import systemRouter from "./routers/systemRouter.js";
import instanceRouter from "./routers/instanceRouter.js";
import weekRouter from "./routers/weekRouter.js";
import statusRouter from "./routers/statusRouter.js";
import taskRouter from "./routers/taskRouter.js";
import calenderRouter from "./routers/calenderRouter.js";
import itemRouter from "./routers/itemRouter.js";
import itemStatusRouter from "./routers/itemStatusRouter.js";
import subTaskRouter from "./routers/subTaskRouter.js";
import stepRouter from "./routers/stepRouter.js";
import groupRouter from "./routers/groupRouter.js";

import { CONNECTION_URL } from "./dataBase.js";

dotenv.config();

const app = express();

const maxRequestBodySize = "1mb";
app.use(express.json({ limit: maxRequestBodySize }));
app.use(express.urlencoded({ limit: maxRequestBodySize, extended: true }));

app.use(cors());
app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.send("API is Running...");
});
// ("mongodb://localhost/projet");

mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use("/api/users", userRouter);
app.use("/api/systems", systemRouter);
app.use("/api/teams", teamRouter);
app.use("/api/groups", groupRouter);
app.use("/api/taskThemes", taskThemeRouter);
app.use("/api/taskModels", taskModelRouter);
app.use("/api/instances", instanceRouter);
app.use("/api/weeks", weekRouter);
app.use("/api/status", statusRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/subTasks", subTaskRouter);
app.use("/api/calenders", calenderRouter);
app.use("/api/items", itemRouter);
app.use("/api/itemStatus", itemStatusRouter);
app.use("/api/steps", stepRouter);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});
