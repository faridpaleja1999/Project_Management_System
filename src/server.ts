import express, { Application } from "express";
import { PORT } from "./configs/config";
import Database from "./database/dbConnection";
import indexRoute from "./routes/index";


const database = new Database();
const app: Application = express();

// Middleware
app.use(express.json());

// Basic route
app.get("/health", async(req, res) => {
  res.send("Project Management API is running!");
});

app.use("/api/v1", indexRoute);

app.listen(PORT, async () => {
  try {
    await database.connect();
    console.log(`MySQL connected!`);
    console.log(`Server connected-Port:${PORT}`);
    console.log(
      "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    );
  } catch (error) {
    console.error(error);
    console.error(`Unable to connect to database.`);
    console.error(`Error-${error}`);
    process.stdin.emit("SIGINT");
    process.exit(1);
  }
});
