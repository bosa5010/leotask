import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin } from "../utils.js";
import TaskModel from "../models/taskModelModel.js";

const taskModelRouter = express.Router();

taskModelRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const groups = req.query.groups ? req.query.groups.split(",") : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const groupFilter = groups ? { groups: { $in: groups } } : {};

    const count = await TaskModel.countDocuments({
      deleted: false,
      ...nameFilter,
      ...groupFilter,
    });

    const taskModels = await TaskModel.find({
      deleted: false,
      ...nameFilter,
      ...groupFilter,
    })
      .populate({
        path: "taskTheme",
        populate: {
          path: "teams",
          model: "Team",
        },
      })
      .populate({
        path: "groups",
        populate: {
          path: "team",
          model: "Team",
        },
      })
      .populate("systems")
      .populate({
        path: "steps",
        populate: {
          path: "items",
          model: "Item",
          populate: {
            path: "itemStatus",
            model: "ItemStatus",
          },
        },
      })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ taskModels, pageNumber, pageSize, pages: count });
  })
);

taskModelRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const taskModel = await TaskModel.findById(req.params.id)
      .populate("taskTheme")
      .populate("groups")
      .populate("systems")
      .populate({
        path: "steps",
        populate: {
          path: "items",
          model: "Item",
          populate: {
            path: "itemStatus",
            model: "ItemStatus",
          },
        },
      });
    if (taskModel && taskModel.deleted === false) {
      res.send(taskModel);
    } else {
      res.status(404).send({ message: "taskModel not found" });
    }
  })
);

taskModelRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const taskModel = new TaskModel({
      name: req.body.taskModel.name,
      description: req.body.taskModel.description,
      taskTheme: req.body.taskModel.taskTheme,
      groups: req.body.taskModel.groups,
      steps: req.body.taskModel.steps,
      systems: req.body.taskModel.systems,
    });
    const createdTaskModel = await taskModel.save();
    res.send({ message: "taskModel created", taskModel: createdTaskModel });
  })
);

taskModelRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const taskModel = await TaskModel.findById(req.params.id);
    if (taskModel && taskModel.deleted === false) {
      taskModel.name = req.body.name || taskModel.name;
      taskModel.description = req.body.description || taskModel.description;
      taskModel.taskTheme = req.body.taskTheme || taskModel.taskTheme;
      taskModel.groups = req.body.groups || taskModel.groups;
      taskModel.steps = req.body.steps || taskModel.steps;
      taskModel.systems = req.body.systems || taskModel.systems;
      const updatedTaskModel = await taskModel.save();
      res.send({
        message: "taskModel updated succufaly",
        taskModel: updatedTaskModel,
      });
    } else {
      res.status(404).send({ message: "taskModel not found" });
    }
  })
);

taskModelRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const taskModel = await TaskModel.findById(req.params.id);
    if (taskModel || taskModel.deleted === false) {
      taskModel.deleted = true;
      const deletedTaskModel = await taskModel.save();
      res.send({ message: "taskModel deleted", taskModel: deletedTaskModel });
    } else {
      res.status(404).send({ message: " taskModel not found" });
    }
  })
);

export default taskModelRouter;
