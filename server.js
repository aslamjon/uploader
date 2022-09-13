// Requiring module
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
require("dotenv").config();
const logger = require("./src/utils/logger");

const config = require("./config");

const app = express();

function shouldCompress(req, res) {
  // don't compress responses with this request header
  if (req.headers["x-no-compression"]) return false;
  // fallback to standard filter function
  return compression.filter(req, res);
}

// COMPRESS MIDDLEWARES
app.use(compression({ filter: shouldCompress }));

// const createDefaultFolder = (dirName) => !fs.existsSync(dirName) && fs.mkdirSync(dirName, { recursive: true });

// createDefaultFolder(config.CACHE_PATH);
// createDefaultFolder(config.IMAGES_PATH);
// createDefaultFolder(config.DELETE_ALL_FILES_PATH);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true })); // if json come backend then it convert to obj in req.body

const directoryPath = path.join(__dirname, "data");

// download file
app.use("/api/file/:file", (req, res) => {
  const { file } = req.params;
  res.download(`${directoryPath}/${file}`);
  res.status(200);
});

app.use("/api/list", (req, res) => {
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.send({ error: "Unable to scan directory" });
      return console.log("Unable to scan directory: " + err);
    }
    res.send(files);
  });
});

app.get("/flavicon.ico", (req, res) => {
  res.send("");
});

// open file
// app.use("/", express.static(path.join(__dirname, "./public")));

app.use(express.static("routes"));

app.post("/", (req, res) => {
  res.send({ status: "success" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("API Not Found. Please check it and try again.");
  err.status = 404;
  next(err);
});

// Error handle
app.use((err, req, res, next) => {
  console.log("[Global error middleware]", err.message, err.status, req.method, req.url);
  logger.error(`[Global error middleware] ${err.message} ${err.status} ${err.stack} ${req.method} ${req.url}`);
  res.status(500).send({
    message: err.message,
  });
  next();
});

const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
