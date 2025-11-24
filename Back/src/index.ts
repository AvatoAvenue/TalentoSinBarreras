import "dotenv/config";
import { db } from "./db";
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
