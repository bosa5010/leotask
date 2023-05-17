import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin } from "../utils.js";
import ItemStatus from "../models/itemStatusModel.js";

const itemStatusRouter = express.Router();

itemStatusRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const count = await ItemStatus.countDocuments({
      deleted: false,
      ...nameFilter,
    });

    const itemStatuss = await ItemStatus.find({ deleted: false, ...nameFilter })
      .populate("items")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ itemStatuss, pageNumber, pageSize, pages: count });
  })
);

itemStatusRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const itemStatus = await ItemStatus.findById(req.params.id);
    if (itemStatus && itemStatus.deleted === false) {
      res.send(itemStatus);
    } else {
      res.status(404).send({ message: "item Status not found" });
    }
  })
);

itemStatusRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const itemStatus = new ItemStatus({
      name: req.body.itemStatus.name,
      description: req.body.itemStatus.description,
    });
    const createdItemStatus = await itemStatus.save();
    res.send({ message: "item Status created", itemStatus: createdItemStatus });
  })
);

itemStatusRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const itemStatus = await ItemStatus.findById(req.params.id);
    if (itemStatus && itemStatus.deleted === false) {
      itemStatus.name = req.body.name || itemStatus.name;
      itemStatus.description = req.body.description || itemStatus.description;
      const updatedItemStatus = await itemStatus.save();
      res.send({
        message: "item Status updated successfully",
        itemStatus: updatedItemStatus,
      });
    } else {
      res.status(404).send({ message: "item Status not found" });
    }
  })
);

itemStatusRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const itemStatus = await ItemStatus.findById(req.params.id);
    if (itemStatus || itemStatus.deleted === false) {
      itemStatus.deleted = true;
      const deletedItemStatus = await itemStatus.save();
      res.send({
        message: "item Status deleted",
        itemStatus: deletedItemStatus,
      });
    } else {
      res.status(404).send({ message: " itemStatus not found" });
    }
  })
);

export default itemStatusRouter;
