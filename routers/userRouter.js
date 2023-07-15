import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import data from "../data.js";
import User from "../models/userModel.js";
import { generateToken, isAdmin, isAuth, isSuperAdmin } from "../utils.js";

const userRouter = express.Router();

userRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
      .populate("team")
      .populate("groups")
      .populate("managedTeams");
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          userName: user.userName,
          team: user.team,
          groups: user.groups,
          managedTeams: user.managedTeams,
          email: user.email,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

userRouter.post(
  "/register",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      name: req.body.name,
      userName: req.body.userName,
      password: req.body.userName,
      email: req.body.email,
      isAdmin: req.body.isAdmin,
      isSuperAdmin: req.body.isSuperAdmin,
      team: req.body.team,
      groups: req.body.groups,
      managedTeams: req.body.managedTeams,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const createdUser = await user.save();
    res.send({ message: "User created", user: createdUser });
  })
);

userRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .populate("team")
      .populate("groups")
      .populate("managedTeams");
    if (user && user.deleted === false) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.userId)
      .populate("team")
      .populate("groups")
      .populate("managedTeams");
    if (user && user.deleted === false) {
      if (
        req.body.password &&
        req.body.newPassword &&
        req.body.confirmPassword &&
        bcrypt.compareSync(req.body.password, user.password) &&
        req.body.newPassword === req.body.confirmPassword
      ) {
        user.password = bcrypt.hashSync(req.body.confirmPassword, 8);
        const updatedUser = await user.save();
        res.send({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          userName: user.userName,
          team: user.team,
          groups: user.groups,
          managedTeams: user.managedTeams,
          email: user.email,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,

          token: generateToken(updatedUser),
        });
      } else if (
        req.body.newPassword &&
        req.body.confirmPassword &&
        req.body.newPassword !== req.body.confirmPassword
      ) {
        res.status(404).send({
          message: "New Password and Confirm Password Are Not Matched",
        });
      } else {
        res
          .status(404)
          .send({ message: "Password and User Password Are Not Matched" });
      }
    }
  })
);

userRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 15;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const firstName = req.query.firstName || "";
    const lastName = req.query.lastName || "";
    const groups = req.query.groups ? req.query.groups.split(",") : "";

    const nameFilter =
      name && name !== "" ? { name: { $regex: name, $options: "i" } } : {};

    const firstNameFilter =
      firstName && firstName !== ""
        ? { firstName: { $regex: firstName, $options: "i" } }
        : {};

    const lastNameFilter =
      lastName && lastName !== ""
        ? { lastName: { $regex: lastName, $options: "i" } }
        : {};

    const groupsFilter = groups ? { groups: { $in: groups } } : {};

    const count = await User.countDocuments({
      deleted: false,
      ...nameFilter,
      ...firstNameFilter,
      ...lastNameFilter,
      ...groupsFilter,
    });
    const users = await User.find({
      deleted: false,
      ...nameFilter,
      ...firstNameFilter,
      ...lastNameFilter,
      ...groupsFilter,
    })
      .populate("team")
      .populate("managedTeams")
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);
    res.send({ users, pageNumber, pageSize, pages: count });
  })
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user && user.deleted === false) {
      if (user.isAdmin !== false || user.isSuperAdmin !== false) {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      user.deleted = true;
      const deleteUser = await user.save();
      res.send({ message: "User Deleted", user: deleteUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  isSuperAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user && user.deleted === false && req.body.actionType === "update") {
      user.lastName = req.body.lastName || user.lastName;
      user.firstName = req.body.firstName || user.firstName;
      user.name = req.body.name || user.name;
      user.userName = req.body.userName || user.userName;
      user.password = req.body.password || user.password;
      user.email = req.body.email || user.email;
      user.isSuperAdmin = Boolean(req.body.isSuperAdmin);
      user.isAdmin = Boolean(req.body.isAdmin);

      user.groups = req.body.groups || user.groups;
      user.team = req.body.team || user.team;
      user.managedTeams = req.body.managedTeams || user.managedTeams;

      const updatedUser = await user.save();

      res.send({ message: "User Updated Successfully", user: updatedUser });
    } else if (
      user &&
      user.deleted === false &&
      req.body.actionType === "resetpassword"
    ) {
      user.password = bcrypt.hashSync(user.userName, 8) || user.password;

      const updatedUser = await user.save();

      res.send({
        message: "User Pasword  Reset Successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

export default userRouter;
