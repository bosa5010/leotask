import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin } from "../utils.js";
import Item from "../models/itemModel.js";

const itemRouter = express.Router();

itemRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const count = await Item.countDocuments({
      deleted: false,
      ...nameFilter,
    });

    const items = await Item.find({ deleted: false, ...nameFilter })
      .populate("itemStatus")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ items, pageNumber, pageSize, pages: count });
  })
);

itemRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id).populate("itemStatus");

    if (item && item.deleted === false) {
      res.send(item);
    } else {
      res.status(404).send({ message: "item not found" });
    }
  })
);

itemRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const item = new Item({
      name: req.body.item.name,
      description: req.body.item.description,
      itemStatus: req.body.item.itemStatus,
    });
    const createdItem = await item.save();
    res.send({ message: "item created", item: createdItem });
  })
);

itemRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (item && item.deleted === false) {
      item.name = req.body.name || item.name;
      item.description = req.body.description || item.description;
      item.itemStatus = req.body.itemStatus || item.itemStatus;
      const updatedItem = await item.save();
      res.send({
        message: "item updated succufaly",
        item: updatedItem,
      });
    } else {
      res.status(404).send({ message: "item not found" });
    }
  })
);

itemRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (item || item.deleted === false) {
      item.deleted = true;
      const deletedItem = await item.save();
      res.send({ message: "item deleted", item: deletedItem });
    } else {
      res.status(404).send({ message: " item not found" });
    }
  })
);

export default itemRouter;
