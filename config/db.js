import mongoose from "mongoose";

//db info
const dbHost = "mongodb://127.0.0.1:27017";
const dbName = "leotask";
const URL = `${dbHost}/${dbName}`;
const OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

//db connection
const connect = mongoose.connect(URL, OPTIONS);
const db = mongoose.connection;

//connect and catch errors
db.on("error", (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

db.on("connected", (err) => {
  console.log(`Connected to ${URL} db`);
});

export default db;
