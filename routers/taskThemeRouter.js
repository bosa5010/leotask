import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin } from "../utils.js";
import TaskTheme from "../models/taskThemeModel.js";

const taskThemeRouter = express.Router();

taskThemeRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const teams = req.query.teams ? req.query.teams.split(",") : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const teamFilter = teams ? { teams: { $in: teams } } : {};

    const count = await TaskTheme.countDocuments({
      deleted: false,
      ...nameFilter,
      ...teamFilter,
    });

    const taskThemes = await TaskTheme.find({
      deleted: false,
      ...nameFilter,
      ...teamFilter,
    })
      .populate("teams")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ taskThemes, pageNumber, pageSize, pages: count });
  })
);

taskThemeRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const taskTheme = await TaskTheme.findById(req.params.id).populate("teams");
    if (taskTheme && taskTheme.deleted === false) {
      res.send(taskTheme);
    } else {
      res.status(404).send({ message: "taskTheme not found" });
    }
  })
);

taskThemeRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const taskTheme = new TaskTheme({
      name: req.body.taskTheme.name,
      description: req.body.taskTheme.description,
      teams: req.body.taskTheme.teams,
    });
    const createdTaskTheme = await taskTheme.save();
    res.send({ message: "taskTheme created", taskTheme: createdTaskTheme });
  })
);

taskThemeRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const taskTheme = await TaskTheme.findById(req.params.id);
    if (taskTheme && taskTheme.deleted === false) {
      taskTheme.name = req.body.name || taskTheme.name;
      taskTheme.description = req.body.description || taskTheme.description;
      taskTheme.teams = req.body.teams || taskTheme.teams;
      const updatedTaskTheme = await taskTheme.save();
      res.send({
        message: "taskTheme updated succufaly",
        taskTheme: updatedTaskTheme,
      });
    } else {
      res.status(404).send({ message: "taskTheme not found" });
    }
  })
);

taskThemeRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const taskTheme = await TaskTheme.findById(req.params.id);
    if (taskTheme || taskTheme.deleted === false) {
      taskTheme.deleted = true;
      const deletedTaskTheme = await taskTheme.save();
      res.send({ message: "taskTheme deleted", taskTheme: deletedTaskTheme });
    } else {
      res.status(404).send({ message: " taskTheme not found" });
    }
  })
);

export default taskThemeRouter;
