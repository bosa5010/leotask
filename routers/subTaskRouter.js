import express from "express";
import expressAsyncHandler from "express-async-handler";
import SubTask from "../models/subTaskModel.js";

import { isAuth, isAdmin } from "../utils.js";
import moment from "moment/moment.js";

const subTaskRouter = express.Router();

subTaskRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 100;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const itemComment = req.query.itemComment || "";
    const taskStep = req.query.taskStep || "";
    const task = req.query.task || "";

    const taskModels = req.query.taskModels
      ? req.query.taskModels.split(",")
      : "";

    const tasks = req.query.tasks ? req.query.tasks.split(",") : "";

    const systems = req.query.systems ? req.query.systems.split(",") : "";

    const users = req.query.users ? req.query.users.split(",") : "";

    const instances = req.query.instance ? req.query.instance.split(",") : "";

    const items = req.query.items ? req.query.items.split(",") : "";

    const itemStatus = req.query.itemStatus
      ? req.query.itemStatus.split(",")
      : "";

    var firstDate = req.query.firstDate
      ? new Date(req.query.firstDate)
      : new moment(new Date()).subtract(24, "months").toDate();
    firstDate && firstDate.setHours(0, 0, 0, 0);

    var lastDate = req.query.lastDate
      ? new Date(req.query.lastDate)
      : new Date();
    lastDate && lastDate.setHours(23, 59, 59, 999);

    const itemCommentFilter =
      itemComment && itemComment !== ""
        ? { itemComment: { $regex: itemComment, $options: "i" } }
        : {};

    const taskModelsFilter = taskModels
      ? { taskModel: { $in: taskModels } }
      : {};

    const taskFilter = task ? { task } : {};

    const systemFilter = systems ? { system: { $in: systems } } : {};

    const userFilter = users ? { createdBy: { $in: users } } : {};

    const instanceFilter = instances ? { instance: { $in: instances } } : {};

    const itemFilter = items ? { item: { $in: items } } : {};

    const itemStatusFilter = itemStatus
      ? { itemStatus: { $in: itemStatus } }
      : {};

    const tasksFilter = tasks ? { task: { $in: tasks } } : {};

    const createdAtFilter =
      firstDate && lastDate
        ? {
            createdAt: { $gte: firstDate, $lt: lastDate },
          }
        : {};

    const taskStepFilter =
      taskStep !== "null" && taskStep !== ""
        ? { taskStep: { $in: taskStep } }
        : taskStep !== ""
        ? { taskStep: { $nin: [null] } }
        : {};

    const createdAtSorting = { createdAt: -1 };

    const count = await SubTask.countDocuments({
      deleted: false,
      ...tasksFilter,
      ...taskFilter,
      ...itemCommentFilter,
      ...taskModelsFilter,
      ...taskStepFilter,
      ...systemFilter,
      ...userFilter,
      ...instanceFilter,
      ...itemFilter,
      ...itemStatusFilter,
      ...createdAtFilter,
    });

    const subTasks = await SubTask.find({
      deleted: false,
      ...tasksFilter,
      ...taskFilter,
      ...itemCommentFilter,
      ...taskModelsFilter,
      ...taskStepFilter,
      ...systemFilter,
      ...userFilter,
      ...instanceFilter,
      ...itemFilter,
      ...itemStatusFilter,
      ...createdAtFilter,
    })
      .populate({
        path: "taskModel",
        populate: {
          path: "taskTheme",
          model: "TaskTheme",
        },
      })
      .populate("system")
      .populate("instance")
      .populate("createdBy")
      .populate("updatedBy")
      .populate("taskStep")
      .populate("item")
      .populate("itemStatus")
      .populate("task")

      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize)
      .sort({ ...createdAtSorting });

    res.send({ subTasks, pageNumber, pageSize, pages: count });
  })
);

subTaskRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const subTask = await SubTask.findById(req.params.id)
      .populate("taskModel")
      .populate("system")
      .populate("instance")
      .populate("createdBy")
      .populate("updatedBy")
      .populate("taskStep")
      .populate("item")
      .populate("task")
      .populate("itemStatus");
    if (subTask && subTask.deleted === false) {
      res.send(subTask);
    } else {
      res.subTask(404).send({ message: "subTask not found" });
    }
  })
);

subTaskRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body.subTask.createdBy) {
      req.body.subTask.createdBy = req.user;
    }
    if (!req.body.subTask.updatedBy) {
      req.body.subTask.updatedBy = req.user;
    }

    const subTask = new SubTask({
      task: req.body.subTask.task,
      taskModel: req.body.subTask.taskModel,
      system: req.body.subTask.system,
      instance: req.body.subTask.instance,
      createdBy: req.body.subTask.createdBy,
      updatedBy: req.body.subTask.updatedBy,
      taskStep: req.body.subTask.currentStep,
      item: req.body.subTask.item,
      itemStatus: req.body.subTask.itemStatus,
      itemComment: req.body.subTask.itemComment,
      itemNumber: req.body.subTask.itemNumber,
    });
    const createdSubTask = await subTask.save();

    res.send({ message: "subTask created", subTask: createdSubTask });
  })
);

subTaskRouter.put(
  "/:id",
  isAuth,

  expressAsyncHandler(async (req, res) => {
    if (!req.body.updatedBy) {
      req.body.updatedBy = req.user;
    }

    const subTask = await SubTask.findById(req.params.id);

    if (subTask && subTask.deleted === false) {
      subTask.taskModel = req.body.taskModel || subTask.taskModel;
      subTask.system = req.body.system || subTask.system;
      subTask.instance = req.body.instance || subTask.instance;
      subTask.createdBy = req.body.createdBy || subTask.createdBy;
      subTask.updatedBy = req.body.updatedBy || subTask.updatedBy;
      subTask.taskStep = req.body.taskStep || subTask.taskStep;
      subTask.item = req.body.item || subTask.item;
      subTask.itemStatus = req.body.itemStatus || subTask.itemStatus;
      subTask.itemComment = req.body.itemComment || subTask.itemComment;
      subTask.itemNumber = req.body.itemNumber || subTask.itemNumber;

      const updatedSubTask = await subTask.save();
      res.send({
        message: "subTask updated succufaly",
        subTask: updatedSubTask,
      });
    } else {
      res.subTask(404).send({ message: "subTask not found" });
    }
  })
);

subTaskRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const subTask = await SubTask.findById(req.params.id);
    if (subTask || subTask.deleted === false) {
      subTask.deleted = true;
      const deletedSubTask = await subTask.save();
      res.send({ message: "subTask deleted", subTask: deletedSubTask });
    } else {
      res.subTask(404).send({ message: " subTask not found" });
    }
  })
);

export default subTaskRouter;
