import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin } from "../utils.js";
import Group from "../models/groupModel.js";

const groupRouter = express.Router();

groupRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";

    const teams = req.query.team ? req.query.team.split(",") : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const teamFilter = teams ? { team: { $in: teams } } : {};

    const count = await Group.countDocuments({
      deleted: false,
      ...nameFilter,
      ...teamFilter,
    });

    const groups = await Group.find({
      deleted: false,
      ...nameFilter,
      ...teamFilter,
    })
      .populate("team")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);

    res.send({ groups, pageNumber, pageSize, pages: count });
  })
);

groupRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id).populate("team");
    if (group && group.deleted === false) {
      res.send(group);
    } else {
      res.status(404).send({ message: "group not found" });
    }
  })
);

groupRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const group = new Group({
      name: req.body.group.name,
      description: req.body.group.description,
      team: req.body.group.team,
    });
    const createdGroup = await group.save();
    res.send({ message: "group created", group: createdGroup });
  })
);

groupRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (group && group.deleted === false) {
      group.name = req.body.name || group.name;
      group.description = req.body.description || group.description;
      group.team = req.body.team || group.team;
      const updatedGroup = await group.save();
      res.send({
        message: "group updated succufaly",
        group: updatedGroup,
      });
    } else {
      res.status(404).send({ message: "group not found" });
    }
  })
);

groupRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (group || group.deleted === false) {
      group.deleted = true;
      const deletedGroup = await group.save();
      res.send({ message: "group deleted", group: deletedGroup });
    } else {
      res.status(404).send({ message: " group not found" });
    }
  })
);

export default groupRouter;
