import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin } from "../utils.js";
import Instance from "../models/instanceModel.js";

const instanceRouter = express.Router();

instanceRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;

    const name = req.query.name || "";

    const system =
      req.query.system && req.query.system !== "all" ? req.query.system : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const systemFilter = system ? { system } : {};

    const count = await Instance.countDocuments({
      deleted: false,
      ...nameFilter,
      ...systemFilter,
    });

    const instances = await Instance.find({
      deleted: false,
      ...nameFilter,
      ...systemFilter,
    })
      .populate("system")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ instances, pageNumber, pageSize, pages: count });
  })
);

instanceRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const instance = await Instance.findById(req.params.id).populate("system");
    if (instance && instance.deleted === false) {
      res.send(instance);
    } else {
      res.status(404).send({ message: "instance not found" });
    }
  })
);

instanceRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const instance = new Instance({
      name: req.body.instance.name,
      description: req.body.instance.description,
      system: req.body.instance.system,
    });
    const createdInstance = await instance.save();
    res.send({ message: "instance created", instance: createdInstance });
  })
);

instanceRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const instance = await Instance.findById(req.params.id);
    if (instance && instance.deleted === false) {
      instance.name = req.body.name || instance.name;
      instance.description = req.body.description || instance.description;
      instance.system = req.body.system || instance.system;
      const updatedInstance = await instance.save();
      res.send({
        message: "instance updated succufaly",
        instance: updatedInstance,
      });
    } else {
      res.status(404).send({ message: "instance not found" });
    }
  })
);

instanceRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const instance = await Instance.findById(req.params.id);
    if (instance || instance.deleted === false) {
      instance.deleted = true;
      const deletedInstance = await instance.save();
      res.send({ message: "instance deleted", instance: deletedInstance });
    } else {
      res.status(404).send({ message: " instance not found" });
    }
  })
);

export default instanceRouter;
