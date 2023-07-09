import jwt from "jsonwebtoken";
import SubTask from "./models/subTaskModel.js";
import Task from "./models/taskModel.js";
import Week from "./models/weekModel.js";
import moment from "moment";
import Status from "./models/statusModel.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      userName: user.userName,
      email: user.email,
      team: user.team,
      groups: user.groups,
      managedTeams: user.managedTeams,
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

export const updateTaskStep = async (task, currentStep) => {
  const tempTask = await Task.findById(task._id);
  if (tempTask && tempTask.deleted === false) {
    tempTask.currentStep = currentStep || tempTask.currentStep;

    task.comment && task.comment !== "" && createSubTask(task, task.comment);

    const updatedTask = await tempTask.save();
  }
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

export async function addManySubtasks(req, nbrSubTask) {
  const subTask = req.body.subTask;
  const data = subTask.data;
  const steps = subTask.steps;
  const keysTab = Object.keys(data[0]);
  var createdSubTasks = [];

  // feth all steps
  steps?.forEach((step) => {
    // fetch all step Items
    step.items.forEach((item) => {
      //get all values = item
      var itemName = item?.name;
      const itemTable = data?.filter(
        (element) => element[keysTab[0]].trim() === itemName
      );
      //fetch all item status
      item.itemStatus.forEach(async (itemStatus) => {
        //get all values = item status
        var STATUS = itemStatus?.reference;

        const StatusTable = itemTable?.filter(
          (element) => String(element[keysTab[1]]) === STATUS
        );

        if (StatusTable?.length > 0) {
          const comment =
            StatusTable?.length + " " + itemName + " " + itemStatus?.name;

          const tempSubTask = new SubTask({
            task: req.body.subTask.task,
            taskModel: req.body.subTask.taskModel,
            system: req.body.subTask.system,
            instance: req.body.subTask.instance,
            createdBy: req.body.subTask.createdBy || req.user,
            updatedBy: req.body.subTask.updatedBy || req.user,
            taskStep: step,
            item: item,
            itemStatus: itemStatus,
            itemComment: comment,
            itemNumber: StatusTable?.length,
          });
          const createdSubTask = await tempSubTask.save();
          createdSubTasks.push(createdSubTask);
          nbrSubTask++;
        }
      });
    });
  });
  return createdSubTasks;
}

export async function activeStatus() {
  const numberFilter = { number: { $lte: 2 } };

  const status = await Status.find({
    deleted: false,
    ...numberFilter,
  });

  return status ? objectId(status) : [];
}

export const objectId = (objects) => {
  if (objects) {
    const tempObjects = objects?.map(({ _id }) => _id);
    return tempObjects;
  }
  return [];
};
