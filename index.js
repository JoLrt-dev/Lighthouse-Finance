import dotenv from "dotenv";
import express from "express";
import { cyanBright, cyan } from "colorette";

const app = express();
const port = process.env.APP_PORT || 3000;

app.get("/", (req, res) => {
  res.send("Le serveur est en ligne et il répond !");
});

// Logger Start
app.listen(port, () => {
  console.log(cyanBright("##################################"));
  console.log(cyan(`# Server is running on port ${port} #`));
  console.log(cyanBright("##################################"));
});

process.on("uncaughtException", (error) => {
  console.error(error);
  process.exit(1);
});
// Logger End
