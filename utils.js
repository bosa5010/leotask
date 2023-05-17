import jwt from "jsonwebtoken";
import SubTask from "./models/subTaskModel.js";
import Task from "./models/taskModel.js";
import Week from "./models/weekModel.js";
import moment from "moment";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      userName: user.userName,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      team: user.team,
      managedTeams: user.managedTeams,
    },
    process.env.JWT_SECRET || "somethingsecret",
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      process.env.JWT_SECRET || "somethingsecret",
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: "Invalid Token" });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};

export const createSubTask = (task, comment) => {
  const subTask = new SubTask({
    task: task._id,
    taskModel: task.taskModel,
    system: task.system,
    instance: task.instance,
    createdBy: task.createdBy,
    updatedBy: task.updatedBy,
    taskStep: null,
    item: null,
    itemStatus: null,
    itemComment: comment,
    itemNumber: 0,
  });
  const createdSubTask = subTask.save();
};

export const nextReference = async () => {
  var ref = {
    referenceNumber: 1,
    reference: "task000001",
  };

  const referenceNumberSorting = { referenceNumber: -1 };
  const tasks = await Task.find()
    .sort({ ...referenceNumberSorting })
    .limit(1);
  if (tasks && tasks[0]) {
    ref.referenceNumber = tasks[0].referenceNumber + 1;
    const char = String(ref.referenceNumber);
    ref.reference = "task" + "000000".slice(char.length - 6) + char;
    return ref;
  }

  return ref;
};

export async function nextWeek(startWeek, startFrom, duration, weeks) {
  const numberOfDays = startFrom.dayNumber + duration.numberDays;

  var week = {
    startDate: new moment(startWeek.startDate)
      .add(startFrom.dayNumber, "days")
      .toDate(),
    nextWeek: startWeek,
    endDate: startWeek.endDate,
    closedDate: new moment(startWeek.startDate)
      .add(numberOfDays, "days")
      .toDate(),
    dedline: new moment(startWeek.startDate).add(numberOfDays, "days").toDate(),
  };

  if (numberOfDays > 7) {
    const from_date = moment(week.dedline).startOf("week").format("yyyy-MM-DD");
    const to_date = moment(week.dedline).endOf("week").format("yyyy-MM-DD");

    const selectedWeek = weeks.find(
      (item) =>
        moment(item.startDate).format("yyyy-MM-DD") === from_date &&
        moment(item.endDate).format("yyyy-MM-DD") === to_date
    );

    if (selectedWeek) {
      week.nextWeek = selectedWeek;
      week.endDate = selectedWeek.endDate;
    }
  }

  return week;
}

export async function comingWeeks() {
  var today = new Date();
  var lastweek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 7
  );

  const startDate = moment(lastweek).format("YYYY-MM-DD");

  const startDateFilter =
    startDate && startDate
      ? {
          startDate: { $gte: startDate },
        }
      : {};

  const weeks = await Week.find({
    deleted: false,
    ...startDateFilter,
  });

  return weeks;
}
