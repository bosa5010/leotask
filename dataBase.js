import mongoose from "mongoose";

// export const CONNECTION_URL =
//   "mongodb+srv://yassineboubaker:yassine2021@cluster0.zuwlt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// export const CONNECTION_URL =
//   "mongodb+srv://saberbouagila:boubaker2021@cluster0.n7zh9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// export const CONNECTION_URL =
// "mongodb+srv://saberbouagila:boubaker2021@cluster0.n7zh9.mongodb.net/?retryWrites=true&w=majority";

// export const CONNECTION_URL =
//   "mongodb+srv://saberbouagila:saberbouagila@cluster0.n7zh9.mongodb.net/?retryWrites=true&w=majority";

export const CONNECTION_URL =
  "mongodb+srv://leotask2023:Nevergiveup2023.@cluster0.7yaqesb.mongodb.net/?retryWrites=true&w=majority";

export const connection = mongoose.createConnection(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
