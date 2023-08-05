import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("This is the video conferencing application");
});

app.listen(4000, () => {
  console.log("Server is running at localhost:4000");
});
