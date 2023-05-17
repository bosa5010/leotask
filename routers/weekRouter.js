import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin, comingWeeks } from "../utils.js";
import data from "../data.js";
import Week from "../models/weekModel.js";
import moment from "moment/moment.js";

const weekRouter = express.Router();

weekRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 15;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";

    const newLocal = "year";
    var startDate = req.query.firstDate
      ? new Date(
          moment(moment(req.query.firstDate).startOf("week")).format(
            "YYYY MMM DD"
          )
        )
      : new Date(moment(moment().startOf("year")).format("YYYY MMM DD"));
    startDate && startDate.setHours(0, 0, 0, 0);

    var endDate = req.query.lastDate
      ? new Date(
          moment(moment(req.query.lastDate).endOf("week")).format("YYYY MMM DD")
        )
      : new Date(moment(moment().endOf("year")).format("YYYY MMM DD"));
    endDate && endDate.setHours(23, 59, 59, 999);

    const startDateFilter =
      startDate && endDate
        ? {
            startDate: { $gte: startDate, $lt: endDate },
          }
        : {};

    const endDateFilter =
      startDate && endDate
        ? {
            endDate: { $gte: startDate, $lt: endDate },
          }
        : {};

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const nameSorting = { name: 1 };
    const startDateSorting = { startDate: 1 };

    const count = await Week.countDocuments({
      deleted: false,
      ...nameFilter,
      ...startDateFilter,
      ...endDateFilter,
    });

    const weeks = await Week.find({
      deleted: false,
      ...nameFilter,
      ...startDateFilter,
      ...endDateFilter,
    })
      .sort({ ...startDateSorting })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ weeks, pageNumber, pageSize, pages: count });
  })
);

weekRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    for (let index = 1; index < 53; index++) {
      let today = moment("2023/12/31").add(index, "week");

      // const today = moment(moment().startOf("year")).add(index, "week");

      const from_date = moment(today).startOf("week").toDate();
      const to_date = moment(today).endOf("week").toDate();
      var createdWeek = {};

      const week = new Week({
        startDate: from_date,
        endDate: to_date,
        name:
          "Week " +
          moment(today).format("ww") +
          " - " +
          moment(to_date).format("YYYY"),

        description:
          "Week " +
          moment(today).format("ww") +
          " - " +
          moment(to_date).format("YYYY") +
          "   " +
          moment(from_date).format("DD/MM/YYYY") +
          "  - " +
          moment(to_date).format("DD/MM/YYYY"),
        number: moment(today).format("w"),
      });

      createdWeek = await week.save();
    }
    res.send({ selectedWeek, today, from_date, to_date });
  })
);

weekRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const week = await Week.findById(req.params.id);
    if (week && week.deleted === false) {
      res.send(week);
    } else {
      res.status(404).send({ message: "week not found" });
    }
  })
);

weekRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const week = new Week({
      name: req.body.week.name,
      description: req.body.week.description,
      number: req.body.week.number,
      startDate: req.body.week.startDate,
      endDate: req.body.week.endDate,
    });
    const createdWeek = await week.save();
    res.send({ message: "week created", week: createdWeek });
  })
);

weekRouter.post(
  "/many",
  expressAsyncHandler(async (req, res) => {
    var weeks = [];

    const currentMoment = moment(req.body.weeks.startDate);
    const endMoment = moment(req.body.weeks.endDate);
    while (currentMoment.isBefore(endMoment, "day")) {
      currentMoment.add(1, "weeks");

      const from_date = moment(currentMoment).startOf("week").toDate();
      const to_date = moment(currentMoment).endOf("week").toDate();

      const week = new Week({
        startDate: from_date,
        endDate: to_date,
        name:
          "Week " +
          moment(currentMoment).format("ww") +
          " - " +
          moment(to_date).format("YYYY"),

        description:
          "Week " +
          moment(currentMoment).format("ww") +
          " - " +
          moment(to_date).format("YYYY") +
          "   " +
          moment(from_date).format("DD/MM/YYYY") +
          "  - " +
          moment(to_date).format("DD/MM/YYYY"),
        number: moment(currentMoment).format("w"),
      });

      var createdWeek = await week.save();
      weeks.push(createdWeek);
    }
    res.send({ weeks });
  })
);

weekRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const week = await Week.findById(req.params.id);
    if (week && week.deleted === false) {
      week.name = req.body.name || week.name;
      week.description = req.body.description || week.description;
      week.number = req.body.number || week.number;
      week.startDate = req.body.startDate || week.startDate;
      week.endDate = req.body.endDate || week.endDate;
      const updatedWeek = await week.save();
      res.send({
        message: "week updated succufaly",
        week: updatedWeek,
      });
    } else {
      res.status(404).send({ message: "week not found" });
    }
  })
);

weekRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const week = await Week.findById(req.params.id);
    if (week || week.deleted === false) {
      week.deleted = true;
      const deletedWeek = await week.save();
      res.send({ message: "week deleted", week: deletedWeek });
    } else {
      res.status(404).send({ message: " week not found" });
    }
  })
);

export default weekRouter;
