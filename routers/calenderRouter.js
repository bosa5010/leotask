import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin } from "../utils.js";
import Calender from "../models/calenderModel.js";

const calenderRouter = express.Router();

calenderRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const weeks = req.query.weeks ? req.query.weeks.split(",") : "";

    const users = req.query.users ? req.query.users.split(",") : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const weeksFilter = weeks ? { week: { $in: weeks } } : {};

    const userFilter = users ? { user: { $in: users } } : {};

    const nameSorting = { name: 1 };

    const count = await Calender.countDocuments({
      deleted: false,
      ...nameFilter,
      ...userFilter,
      ...weeksFilter,
    });

    const calenders = await Calender.find({
      deleted: false,
      ...nameFilter,
      ...userFilter,
      ...weeksFilter,
    })
      .populate("user")
      .populate("week")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize)
      .sort({ ...nameSorting });
    res.send({ calenders, pageNumber, pageSize, pages: count });
  })
);

calenderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const calender = await Calender.findById(req.params.id)
      .populate("team")
      .populate("user")
      .populate("week");
    if (calender && calender.deleted === false) {
      res.send(calender);
    } else {
      res.status(404).send({ message: "calender not found" });
    }
  })
);

calenderRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const calender = new Calender({
      name: req.body.calender.name,
      description: req.body.calender.description,
      user: req.body.calender.user,
      week: req.body.calender.week,
    });
    const createdCalender = await calender.save();
    res.send({ message: "calender created", calender: createdCalender });
  })
);

calenderRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const calender = await Calender.findById(req.params.id);
    if (calender && calender.deleted === false) {
      calender.name = req.body.name || calender.name;
      calender.description = req.body.description || calender.description;
      calender.user = req.body.user || calender.user;
      calender.week = req.body.week || calender.week;
      const updatedCalender = await calender.save();
      res.send({
        message: "calender updated succufaly",
        calender: updatedCalender,
      });
    } else {
      res.status(404).send({ message: "calender not found" });
    }
  })
);

calenderRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const calender = await Calender.findById(req.params.id);
    if (calender || calender.deleted === false) {
      calender.deleted = true;
      const deletedCalender = await calender.save();
      res.send({ message: "calender deleted", calender: deletedCalender });
    } else {
      res.status(404).send({ message: " calender not found" });
    }
  })
);

export default calenderRouter;
