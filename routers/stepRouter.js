import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin } from "../utils.js";
import Step from "../models/stepModel.js";

const stepRouter = express.Router();

stepRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const taskModel =
      req.query.taskModel && req.query.taskModel !== "all"
        ? req.query.taskModel
        : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const taskModelFilter = taskModel ? { taskModel } : {};

    const NumberSorting = { number: 1 };

    const count = await Step.countDocuments({
      deleted: false,
      ...nameFilter,
      ...taskModelFilter,
    });

    const steps = await Step.find({
      deleted: false,
      ...nameFilter,
      ...taskModelFilter,
    })
      .populate("taskModel")
      .populate({
        path: "items",
        populate: {
          path: "itemStatus",
          model: "ItemStatus",
        },
      })
      .sort({ ...NumberSorting })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ steps, pageNumber, pageSize, pages: count });
  })
);

stepRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const step = await Step.findById(req.params.id)
      .populate("taskModel")
      .populate({
        path: "items",
        populate: {
          path: "itemStatus",
          model: "ItemStatus",
        },
      });
    if (step && step.deleted === false) {
      res.send(step);
    } else {
      res.status(404).send({ message: "step not found" });
    }
  })
);

stepRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const step = new Step({
      name: req.body.step.name,
      description: req.body.step.description,
      taskModel: req.body.step.taskModel,
      items: req.body.step.items,
      number: req.body.step.number,
    });
    const createdStep = await step.save();
    res.send({ message: "step created", step: createdStep });
  })
);

stepRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const step = await Step.findById(req.params.id);
    if (step && step.deleted === false) {
      step.name = req.body.name || step.name;
      step.description = req.body.description || step.description;
      step.taskModel = req.body.taskModel || step.taskModel;
      step.items = req.body.items || step.items;
      step.number = req.body.number || step.number;
      const updatedStep = await step.save();
      res.send({
        message: "step updated succufaly",
        step: updatedStep,
      });
    } else {
      res.status(404).send({ message: "step not found" });
    }
  })
);

stepRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const step = await Step.findById(req.params.id);
    if (step || step.deleted === false) {
      step.deleted = true;
      const deletedStep = await step.save();
      res.send({ message: "step deleted", step: deletedStep });
    } else {
      res.status(404).send({ message: " step not found" });
    }
  })
);

export default stepRouter;
