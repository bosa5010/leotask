import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin } from "../utils.js";
import Status from "../models/statusModel.js";

const statusRouter = express.Router();

statusRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 15;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const count = await Status.countDocuments({
      deleted: false,
      ...nameFilter,
    });

    const NumberSorting = { number: 1 };

    const status = await Status.find({ deleted: false, ...nameFilter })
      .populate("taskModels")
      .sort({ ...NumberSorting })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);

    res.send({ status, pageNumber, pageSize, pages: count });
  })
);

statusRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const status = await Status.findById(req.params.id);
    if (status && status.deleted === false) {
      res.send(status);
    } else {
      res.status(404).send({ message: "status not found" });
    }
  })
);

statusRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const status = new Status({
      name: req.body.status.name,
      description: req.body.status.description,
      number: req.body.status.number,
    });
    const createdStatus = await status.save();
    res.send({ message: "status created", status: createdStatus });
  })
);

statusRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const status = await Status.findById(req.params.id);
    if (status && status.deleted === false) {
      status.name = req.body.name || status.name;
      status.description = req.body.description || status.description;
      status.number = req.body.number || status.number;
      const updatedStatus = await status.save();
      res.send({
        message: "status updated succufaly",
        status: updatedStatus,
      });
    } else {
      res.status(404).send({ message: "status not found" });
    }
  })
);

statusRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const status = await Status.findById(req.params.id);
    if (status || status.deleted === false) {
      status.deleted = true;
      const deletedStatus = await status.save();
      res.send({ message: "status deleted", status: deletedStatus });
    } else {
      res.status(404).send({ message: " status not found" });
    }
  })
);

export default statusRouter;
