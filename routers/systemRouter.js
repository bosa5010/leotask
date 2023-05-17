import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin } from "../utils.js";
import System from "../models/systemModel.js";

const systemRouter = express.Router();

systemRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const count = await System.countDocuments({
      deleted: false,
      ...nameFilter,
    });

    const systems = await System.find({ deleted: false, ...nameFilter })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);

    res.send({ systems, pageNumber, pageSize, pages: count });
  })
);

systemRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const system = await System.findById(req.params.id);
    if (system && system.deleted === false) {
      res.send(system);
    } else {
      res.status(404).send({ message: "system not found" });
    }
  })
);

systemRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const system = new System({
      name: req.body.system.name,
      description: req.body.system.description,
    });
    const createdSystem = await system.save();
    res.send({ message: "system created", system: createdSystem });
  })
);

systemRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const system = await System.findById(req.params.id);
    if (system && system.deleted === false) {
      system.name = req.body.name || system.name;
      system.description = req.body.description || system.description;
      const updatedSystem = await system.save();
      res.send({
        message: "system updated succufaly",
        system: updatedSystem,
      });
    } else {
      res.status(404).send({ message: "system not found" });
    }
  })
);

systemRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const system = await System.findById(req.params.id);
    if (system || system.deleted === false) {
      system.deleted = true;
      const deletedSystem = await system.save();
      res.send({ message: "system deleted", system: deletedSystem });
    } else {
      res.status(404).send({ message: " system not found" });
    }
  })
);

export default systemRouter;
