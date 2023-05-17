import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAuth, isAdmin, isSuperAdmin } from "../utils.js";
import data from "../data.js";
import Team from "../models/teamModel.js";

const teamRouter = express.Router();

teamRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const count = await Team.countDocuments({
      deleted: false,
      ...nameFilter,
    });

    const teams = await Team.find({ deleted: false, ...nameFilter })
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ teams, pageNumber, pageSize, pages: count });
  })
);

teamRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (team && team.deleted === false) {
      res.send(team);
    } else {
      res.status(404).send({ message: "team not found" });
    }
  })
);

teamRouter.post(
  "/",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const team = new Team({
      name: req.body.team.name,
      description: req.body.team.description,
    });
    const createdTeam = await team.save();
    res.send({ message: "team created", team: createdTeam });
  })
);

teamRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (team && team.deleted === false) {
      team.name = req.body.name || team.name;
      team.description = req.body.description || team.description;
      const updatedTeam = await team.save();
      res.send({
        message: "team updated succufaly",
        team: updatedTeam,
      });
    } else {
      res.status(404).send({ message: "team not found" });
    }
  })
);

teamRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (team || team.deleted === false) {
      team.deleted = true;
      const deletedTeam = await team.save();
      res.send({ message: "team deleted", team: deletedTeam });
    } else {
      res.status(404).send({ message: " team not found" });
    }
  })
);

export default teamRouter;
