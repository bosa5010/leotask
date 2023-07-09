import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin } from "../utils.js";
import data from "../data.js";
import Appointment from "../models/appointmentModel.js";
import moment from "moment/moment.js";

const appointmentRouter = express.Router();

appointmentRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 15;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const text = req.query.text || "";

    const users = req.query.users ? req.query.users.split(",") : "";

    const newLocal = "year";
    var startDate = req.query.firstDate
      ? new Date(
          moment(moment(req.query.firstDate).startOf("week")).format(
            "YYYY MMM DD"
          )
        )
      : new Date(moment(moment().startOf("month")).format("YYYY MMM DD"));
    startDate && startDate.setHours(0, 0, 0, 0);

    var endDate = req.query.lastDate
      ? new Date(
          moment(moment(req.query.lastDate).endOf("week")).format("YYYY MMM DD")
        )
      : new Date(moment(moment().endOf("month")).format("YYYY MMM DD"));
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

    const textFilter =
      text && text !== "" ? { text: { $regex: text, $options: "i" } } : {};

    const userFilter = users ? { user: { $in: users } } : {};

    const startDateSorting = { startDate: 1 };

    const count = await Appointment.countDocuments({
      deleted: false,
      ...textFilter,
      ...startDateFilter,
      ...endDateFilter,
      ...userFilter,
    });

    const appointments = await Appointment.find({
      deleted: false,
      ...textFilter,
      ...startDateFilter,
      ...endDateFilter,
      ...userFilter,
    })
      .sort({ ...startDateSorting })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);

    res.send({ appointments, pageNumber, pageSize, pages: count });
  })
);

appointmentRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    for (let index = 1; index < 53; index++) {
      let today = moment("2023/12/31").add(index, "appointment");

      // const today = moment(moment().startOf("year")).add(index, "appointment");

      const from_date = moment(today).startOf("appointment").toDate();
      const to_date = moment(today).endOf("appointment").toDate();
      var createdAppointment = {};

      const appointment = new Appointment({
        startDate: from_date,
        endDate: to_date,
        text:
          "Appointment " +
          moment(today).format("ww") +
          " - " +
          moment(to_date).format("YYYY"),

        description:
          "Appointment " +
          moment(today).format("ww") +
          " - " +
          moment(to_date).format("YYYY") +
          "   " +
          moment(from_date).format("DD/MM/YYYY") +
          "  - " +
          moment(to_date).format("DD/MM/YYYY"),
        number: moment(today).format("w"),
      });

      createdAppointment = await appointment.save();
    }
    res.send({ selectedAppointment, today, from_date, to_date });
  })
);

appointmentRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment && appointment.deleted === false) {
      res.send(appointment);
    } else {
      res.status(404).send({ message: "appointment not found" });
    }
  })
);

appointmentRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const appointment = new Appointment({
      text: req.body.appointment.text,
      description: req.body.appointment.description,
      user: req.body.appointment.user,
      startDate: req.body.appointment.startDate,
      endDate: req.body.appointment.endDate,
    });
    const createdAppointment = await appointment.save();
    res.send({
      message: "appointment created",
      appointment: createdAppointment,
    });
  })
);

appointmentRouter.post(
  "/many",
  expressAsyncHandler(async (req, res) => {
    var appointments = [];

    const currentMoment = moment(req.body.appointments.startDate);
    const endMoment = moment(req.body.appointments.endDate);
    while (currentMoment.isBefore(endMoment, "day")) {
      currentMoment.add(1, "appointments");

      const from_date = moment(currentMoment).startOf("appointment").toDate();
      const to_date = moment(currentMoment).endOf("appointment").toDate();

      const appointment = new Appointment({
        startDate: from_date,
        endDate: to_date,
        text:
          "Appointment " +
          moment(currentMoment).format("ww") +
          " - " +
          moment(to_date).format("YYYY"),

        description:
          "Appointment " +
          moment(currentMoment).format("ww") +
          " - " +
          moment(to_date).format("YYYY") +
          "   " +
          moment(from_date).format("DD/MM/YYYY") +
          "  - " +
          moment(to_date).format("DD/MM/YYYY"),
        number: moment(currentMoment).format("w"),
      });

      var createdAppointment = await appointment.save();
      appointments.push(createdAppointment);
    }
    res.send({ appointments });
  })
);

appointmentRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment && appointment.deleted === false) {
      appointment.text = req.body.text || appointment.text;
      appointment.description = req.body.description || appointment.description;
      appointment.user = req.body.user || appointment.user;
      appointment.startDate = req.body.startDate || appointment.startDate;
      appointment.endDate = req.body.endDate || appointment.endDate;
      const updatedAppointment = await appointment.save();
      res.send({
        message: "appointment updated succufaly",
        appointment: updatedAppointment,
      });
    } else {
      res.status(404).send({ message: "appointment not found" });
    }
  })
);

appointmentRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment || appointment.deleted === false) {
      appointment.deleted = true;
      const deletedAppointment = await appointment.save();
      res.send({
        message: "appointment deleted",
        appointment: deletedAppointment,
      });
    } else {
      res.status(404).send({ message: " appointment not found" });
    }
  })
);

export default appointmentRouter;
