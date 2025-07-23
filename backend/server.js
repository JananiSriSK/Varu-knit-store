import app from "./app.js";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
dotenv.config({ path: "./config/.env" });

connectdb();
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("server is shutting down due to unhandled exception error");
  process.exit(1);
});

//console.log(myname);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server is shutting down, due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1); //s=connection closed has to restart again
  });
});
