import express from "express";
import expressAsyncHandler from "express-async-handler";

import {
  isAuth,
  isAdmin,
  createSubTask,
  nextReference,
  nextWeek,
  comingWeeks,
} from "../utils.js";
import moment from "moment/moment.js";
import Task from "../models/taskModel.js";
import SubTask from "../models/subTaskModel.js";

const taskRouter = express.Router();

taskRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 15;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const description = req.query.description || "";
    const reference = req.query.reference || "";
    const taskModels = req.query.taskModels
      ? req.query.taskModels.split(",")
      : "";

    const status = req.query.status ? req.query.status.split(",") : "";
    const users = req.query.users ? req.query.users.split(",") : "";

    const instances = req.query.instance ? req.query.instance.split(",") : "";

    var firstDate = req.query.firstDate
      ? new Date(req.query.firstDate)
      : new moment(new Date()).subtract(24, "months").toDate();
    firstDate && firstDate.setHours(0, 0, 0, 0);

    var lastDate = req.query.lastDate
      ? new Date(req.query.lastDate)
      : moment().add(24, "months").toDate();
    lastDate && lastDate.setHours(23, 59, 59, 999);

    var tomorrow =
      req.query.firstDate && req.query.lastDate
        ? new Date(req.query.lastDate)
        : moment().add(1, "days").toDate();
    tomorrow && tomorrow.setHours(0, 0, 0, 0);

    const descriptionFilter =
      description && description !== ""
        ? { description: { $regex: description, $options: "i" } }
        : {};

    const referenceFilter =
      reference && reference !== ""
        ? { reference: { $regex: reference, $options: "i" } }
        : {};

    const taskModelsFilter = taskModels
      ? { taskModel: { $in: taskModels } }
      : {};

    const statusFilter = status ? { status: { $in: status } } : {};

    const userFilter = users ? { responsibleUser: { $in: users } } : {};

    const instanceFilter = instances ? { instance: { $in: instances } } : {};

    const startDateFilter =
      firstDate && tomorrow
        ? {
            startDate: { $gte: firstDate, $lt: tomorrow },
          }
        : {};

    const endDateFilter =
      firstDate && lastDate
        ? {
            endDate: { $gte: firstDate, $lt: lastDate },
          }
        : {};

    const startDateSorting = { startDate: -1 };

    const statusSorting = { status: 1 };

    const count = await Task.countDocuments({
      deleted: false,
      ...descriptionFilter,
      ...referenceFilter,
      ...taskModelsFilter,
      ...statusFilter,
      ...userFilter,
      ...instanceFilter,
      ...startDateFilter,
      ...endDateFilter,
    });

    const tasks = await Task.find({
      deleted: false,
      ...descriptionFilter,
      ...referenceFilter,
      ...taskModelsFilter,
      ...statusFilter,
      ...userFilter,
      ...instanceFilter,
      ...startDateFilter,
      ...endDateFilter,
    })
      .populate({
        path: "taskModel",
        populate: {
          path: "steps",
          model: "Step",
          populate: {
            path: "items",
            model: "Item",
            populate: {
              path: "itemStatus",
              model: "ItemStatus",
            },
          },
        },
      })
      .populate({
        path: "taskModel",
        populate: {
          path: "systems",
          model: "System",
        },
      })
      .populate("system")
      .populate("instance")
      .populate("startWeek")
      .populate("endWeek")
      .populate("createdBy")
      .populate("responsibleUser")
      .populate("responsibleUsers")
      .populate("status")
      .populate("currentStep")
      .sort({ ...startDateSorting, ...statusSorting })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);

    res.send({ tasks, pageNumber: pageNumber, pageSize, pages: count });
  })
);

taskRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
      .populate("system")
      .populate("instance")
      .populate("startWeek")
      .populate("endWeek")
      .populate("createdBy")
      .populate("responsibleUser")
      .populate("responsibleUsers")
      .populate("status")
      .populate({
        path: "currentStep",
        populate: {
          path: "items",
          model: "Item",
          populate: {
            path: "itemStatus",
            model: "ItemStatus",
          },
        },
      })
      .populate({
        path: "taskModel",
        populate: {
          path: "steps",
          model: "Step",
          populate: {
            path: "items",
            model: "Item",
            populate: {
              path: "itemStatus",
              model: "ItemStatus",
            },
          },
        },
      })
      .populate({
        path: "taskModel",
        populate: {
          path: "systems",
          model: "System",
        },
      });

    if (task && task.deleted === false) {
      res.send(task);
    } else {
      res.task(404).send({ message: "task not found" });
    }
  })
);

taskRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const referenceNumberSorting = { referenceNumber: -1 };
    const tasks = await Task.find()
      .sort({ ...referenceNumberSorting })
      .limit(1);

    const ref = await nextReference();

    if (ref) {
      req.body.task.referenceNumber = ref.referenceNumber;
      req.body.task.reference = ref.reference;
    }

    if (!req.body.task.responsibleUser) {
      req.body.task.responsibleUser = null;
    }
    if (!req.body.task.responsibleUsers) {
      req.body.task.responsibleUsers = null;
    }
    if (!req.body.task.createdBy) {
      req.body.task.createdBy = req.user;
    }

    const task = new Task({
      description: req.body.task.description,
      shortDescription: req.body.task.shortDescription,
      reference: req.body.task.reference,
      referenceNumber: req.body.task.referenceNumber,
      taskModel: req.body.task.taskModel,
      currentStep: req.body.task.currentStep,
      system: req.body.task.system,
      instance: req.body.task.instance,
      startWeek: req.body.task.startWeek,
      startDate: req.body.task.startDate,
      endWeek: req.body.task.endWeek,
      endDate: req.body.task.endDate,
      closedDate: req.body.task.closedDate,
      dedline: req.body.task.dedline,
      responsibleUser: req.body.task.responsibleUser,
      createdBy: req.body.task.createdBy,
      responsibleUsers: req.body.task.responsibleUsers,
      status: req.body.task.status,
    });
    const createdTask = await task.save();

    createSubTask(task, "Task " + createdTask.reference + " created");

    const taskTable = [];
    taskTable.push(createdTask);
    res.send({ message: "task created", task: taskTable });
  })
);

taskRouter.post(
  "/many",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    var createdTasks = [];
    const weeks = await comingWeeks();

    const ref = await nextReference();
    req.body.tasks.startWeek?.map(async (startWeek, index) => {
      var nextWeeks = await nextWeek(
        startWeek,
        req.body.tasks.startFrom,
        req.body.tasks.duration,
        weeks
      );

      req.body.tasks.instance?.map(async (instance) => {
        const task = new Task({
          description: req.body.tasks.description,
          shortDescription: req.body.tasks.shortDescription,
          reference: ref.reference,
          referenceNumber: ref.referenceNumber,
          taskModel: req.body.tasks.taskModel,
          currentStep: req.body.tasks.currentStep,
          system: req.body.tasks.system,
          instance: instance,
          startWeek: startWeek,
          startDate: nextWeeks.startDate,
          endWeek: nextWeeks.nextWeek,
          endDate: nextWeeks.endDate,
          closedDate: nextWeeks.closedDate,
          dedline: nextWeeks.dedline,
          responsibleUser: req.body.tasks.responsibleUser || null,
          createdBy: req.body.tasks.createdBy || req.user,
          responsibleUsers: req.body.tasks.responsibleUsers || null,
          status: req.body.tasks.status,
        });

        createdTasks.push(task);

        ref.referenceNumber = ref.referenceNumber + 1;
        const char = String(ref.referenceNumber);
        ref.reference = "task" + "000000".slice(char.length - 6) + char;
      });
    });
    const createdTasksTable = await Task.insertMany(createdTasks);

    createdTasksTable.forEach((createdTask) => {
      createSubTask(createdTask, "Task " + createdTask.reference + " created");
    });

    res.send({ message: "tasks created", tasks: createdTasksTable });
  })
);

taskRouter.put(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
      .populate("taskModel")
      .populate("system")
      .populate("instance")
      .populate("startWeek")
      .populate("endWeek")
      .populate("createdBy")
      .populate("responsibleUser")
      .populate("responsibleUsers")
      .populate("status")
      .populate("currentStep");

    if (task && task.deleted === false) {
      task.description = req.body.description || task.description;
      task.shortDescription =
        req.body.shortDescription || task.shortDescription;
      task.reference = req.body.reference || task.reference;
      task.referenceNumber = req.body.referenceNumber || task.referenceNumber;
      task.taskModel = req.body.taskModel || task.taskModel;
      task.currentStep = req.body.currentStep || task.currentStep;
      task.system = req.body.system || task.system;
      task.instance = req.body.instance || task.instance;
      task.startDate = req.body.startDate || task.startDate;
      task.startWeek = req.body.startWeek || task.startWeek;
      task.endDate = req.body.endDate || task.endDate;
      task.endWeek = req.body.endWeek || task.endWeek;
      task.closedDate = req.body.closedDate || task.closedDate;
      task.dedline = req.body.dedline || task.dedline;
      task.createdBy = req.body.createdBy || task.createdBy;
      task.responsibleUser = req.body.responsibleUser || task.responsibleUser;
      task.responsibleUsers =
        req.body.responsibleUsers || task.responsibleUsers;
      task.status = req.body.status || task.status;

      req.body.comment &&
        req.body.comment !== "" &&
        createSubTask(task, req.body.comment);

      const updatedTask = await task.save();

      res.send({
        message: "task updated successfully",
        task: updatedTask,
      });
    } else {
      res.task(404).send({ message: "task not found" });
    }
  })
);

taskRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    const taskFilter = task ? { task } : {};
    const taskStepFilter = { taskStep: { $nin: [null] } };

    if (task || task.deleted === false) {
      const count = await SubTask.countDocuments({
        deleted: false,
        ...taskFilter,
        ...taskStepFilter,
      });

      if (count === 0) {
        task.deleted = true;
        const deletedTask = await task.save();
        res.send({ message: "task deleted", task: deletedTask });
      } else {
        res
          .status(404)
          .send({ message: " task found please delete subtasks before" });
      }
    } else {
      res.task(404).send({ message: " task not found" });
    }
  })
);

export default taskRouter;
