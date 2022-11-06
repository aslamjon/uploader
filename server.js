// Requiring module
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const compression = require("compression");
require("dotenv").config();
const { connectDb } = require("./src/services/db/db");

const logger = require("./src/utils/logger");

const config = require("./config");
const { uploadRouter } = require("./src/routers");

const app = express();

function shouldCompress(req, res) {
  // don't compress responses with this request header
  if (req.headers["x-no-compression"]) return false;
  // fallback to standard filter function
  return compression.filter(req, res);
}

// COMPRESS MIDDLEWARES
app.use(compression({ filter: shouldCompress }));

const createDefaultFolder = (dirName) => !fs.existsSync(dirName) && fs.mkdirSync(dirName, { recursive: true });

createDefaultFolder(config.CACHE_PATH);
createDefaultFolder(config.DATA_PATH);
createDefaultFolder(config.DELETE_ALL_FILES_PATH);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true })); // if json come backend then it convert to obj in req.body

app.use("/api/attachment/upload", uploadRouter);

app.use(express.static("routes"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("API Not Found. Please check it and try again.");
  err.status = 404;
  next(err);
});

// Error handle
app.use((err, req, res, next) => {
  logger.error(`[Global error middleware] ${err.message} -> ${err.status} -> ${req.method} -> ${req.url} -> ${err.stack}`);
  res.status(500).send({
    error: err.message,
    url: req.url,
  });
  next();
});

const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDb();
});
