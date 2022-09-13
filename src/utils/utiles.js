const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { Types } = require("mongoose");
const { errors } = require("./constants");
const logger = require("./logger");
const { isString } = require("lodash");
const config = require("../../config");
const moment = require("moment");

let logData = [];
try {
  logData = require("./data/logger.json");
} catch (e) {
  // console.log(e.message)
}
const writeData = (filename, content) => {
  fs.writeFile(filename, JSON.stringify(content, null, 4), "utf8", (err) => {
    if (err) console.log(err);
  });
};

const handleError = (err, res) => {
  // console.log("ERROR", err);
  res.status(500).contentType("text/plain").send({ message: "Oops! Something went wrong!" });
};
// *****************- Images -**********************
async function saveImg(req, res, file, types = [".png", ".jpeg", ".jpg"]) {
  try {
    const cacheImgPath = file.path;
    let originalName = file.originalname;

    function addDateTime(name, other = "") {
      const newDate = moment();
      const orginalNameArr = name.split(".");
      const fileType = orginalNameArr.pop();
      const getDate = newDate.format("DD-MM-YYYY");
      const getTime = newDate.format("HH-mm-ss-SSS");
      orginalNameArr.push(`__${getDate}__${getTime}${other}.${fileType}`);
      return orginalNameArr.join("");
    }

    originalName = addDateTime(originalName, `__${req.user.userId}`);
    // const targetPath = path.join(__dirname, `./../../data/images/${originalName}`);
    const targetPath = `${config.IMAGES_PATH}${originalName}`;

    // Create Img
    if (types.includes(path.extname(file.originalname).toLowerCase())) {
      const resultRename = await rename(cacheImgPath, targetPath);
      if (!resultRename) handleError("", res);
      else return originalName;
    } else {
      // Delete cache
      const resUnlik = await unlink(cacheImgPath);
      if (!resUnlik) handleError("", res);
      else {
        res
          .status(403)
          .contentType("text/plain")
          .send({ message: `Only ${types.join(", ")} files are allowed!` });
      }
    }
  } catch (error) {
    throw new Error(`${error.message} from saveImg`);
  }
}

async function saveImgs(req, res, fieldnames = ["file"]) {
  try {
    if (_.isEmpty(req.files)) {
      res.status(400).send({ message: `Bad request: please send ${fieldnames.join(", ")}` });
      req.files = [];
    } else if (req.files.length !== fieldnames.length) {
      for (let i = 0; req.files.length > i; i++) {
        // Delete cache
        const resUnlik = await unlink(req.files[i].path);
        if (!resUnlik) handleError("", res);
      }
      res.status(400).send({ message: `Bad request: please send ${fieldnames.join(", ")}` });
    } else {
      let imgs = {};
      // check fieldname
      for (let i = 0; fieldnames.length > i; i++) {
        if (!fieldnames.includes(req.files[i].fieldname)) res.status(400).send({ message: "Bad request" });
      }

      for (let i = 0; fieldnames.length > i; i++) {
        imgs[req.files[i].fieldname] = await saveImg(req, res, req.files[i]);
      }
      return imgs;
    }
  } catch (error) {
    // console.log(error)
    throw new Error(`${error.message} from saveImgs`);
    // throw new Error("IMAGE_IS_NOT_SAVED")
  }
}

function rename(previousName, newName) {
  return new Promise((resolve, reject) => {
    fs.rename(previousName, newName, (err) => {
      if (err) resolve(0);
      resolve(1);
    });
  });
}
function unlink(tempPath) {
  return new Promise((resolve, reject) => {
    fs.unlink(tempPath, (err) => {
      if (err) resolve(0);
      resolve(1);
    });
  });
}
// ************************- encoding and decoding -********************************
const encodingBase64 = (filePath) => {
  const file = fs.readFileSync(filePath, { encoding: "base64" });
  // return file.toString('base64');
  return file;
};

const decodingBase64 = (data, fileName) => {
  let buff = new Buffer.from(data, "base64");
  fs.writeFileSync(fileName, buff);
};
// **********************************- date format -************************************************

function formatDate(format, date = new Date(), utc) {
  // const map = {
  //     mm: date.getMonth() + 1,
  //     dd: date.getDate(),
  //     yy: date.getFullYear().toString().slice(-2),
  //     yyyy: date.getFullYear()
  // }
  // return format.replace(/mm|dd|yyyy|yy/gi, matched => map[matched])
  // return date.toLocaleDateString("en-US");
  let MMMM = [
    "\x00",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function ii(i, len) {
    let s = i + "";
    len = len || 2;
    while (s.length < len) s = "0" + s;
    return s;
  }

  let y = utc ? date.getUTCFullYear() : date.getFullYear();
  format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
  format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
  format = format.replace(/(^|[^\\])y/g, "$1" + y);

  let M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
  format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
  format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
  format = format.replace(/(^|[^\\])M/g, "$1" + M);

  let d = utc ? date.getUTCDate() : date.getDate();
  format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
  format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
  format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
  format = format.replace(/(^|[^\\])d/g, "$1" + d);

  let H = utc ? date.getUTCHours() : date.getHours();
  format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
  format = format.replace(/(^|[^\\])H/g, "$1" + H);

  let h = H > 12 ? H - 12 : H == 0 ? 12 : H;
  format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
  format = format.replace(/(^|[^\\])h/g, "$1" + h);

  let m = utc ? date.getUTCMinutes() : date.getMinutes();
  format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
  format = format.replace(/(^|[^\\])m/g, "$1" + m);

  let s = utc ? date.getUTCSeconds() : date.getSeconds();
  format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
  format = format.replace(/(^|[^\\])s/g, "$1" + s);

  let f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
  format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])f/g, "$1" + f);

  let T = H < 12 ? "AM" : "PM";
  format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
  format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

  let t = T.toLowerCase();
  format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
  format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

  let tz = -date.getTimezoneOffset();
  let K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
  if (!utc) {
    tz = Math.abs(tz);
    let tzHrs = Math.floor(tz / 60);
    let tzMin = tz % 60;
    K += ii(tzHrs) + ":" + ii(tzMin);
  }
  format = format.replace(/(^|[^\\])K/g, "$1" + K);

  let day = (utc ? date.getUTCDay() : date.getDay()) + 1;
  format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
  format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

  format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
  format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

  format = format.replace(/\\(.)/g, "$1");

  return format;
}

function ISODate(date = new Date()) {
  return date.toISOString();
}

function setYear(year, date = new Date()) {
  let Year = new Date().setFullYear(year);
  return new Date(Year);
}

function getTime(format = 24, date = new Date()) {
  if (format == 24) return date.toUTCString().split(" ")[4];
  else return date.toLocaleString().split(" ")[1];
}

// ********************************************************

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

function toFixed(number, n = 2) {
  return Number(Number(number).toFixed(n));
}

// function logger(text, { status = "INFO", filename = "./data/logger.json", res = '' }) {
//     logData.push({ [status]: text, date: `${formatDate('mm/dd/yyyy')} ${getTime()}` });
//     if (res) res.status(500).send({ message: "Something wrong!" });
//     fs.writeFile(filename, JSON.stringify(logData, null, 4), 'utf8', (err) => {
//         if (err) console.log(err);
//     });
// }

const errorHandling = (e, functionName, res) => {
  logger.error(`${e.message} -> ${fileName} -> ${functionName} -> ${e.stack}`);
  errors.SERVER_ERROR(res);
};

const hideFields = (items = {}) => ({
  deleted: 0,
  deletedAt: 0,
  deletedById: 0,
  updatedById: 0,
  updated: 0,
  __v: 0,
  password: 0,
  ...items,
});

const getDataFromModelByQuery = ({ Model, hideFieldQuery = {}, query = {}, withDelete = false }) =>
  Model.find(withDelete ? query : { ...query, deleted: { $eq: false } }, hideFields(hideFieldQuery));
const getOneFromModelByQuery = ({ Model, hideFieldQuery = {}, query = {}, withDelete = false }) =>
  Model.findOne(withDelete ? query : { ...query, deleted: { $eq: false } }, hideFields(hideFieldQuery));

const getTimes = () => new Date().getTime();

const deleteFormat = ({ item = {}, id }) => {
  item.deleted = true;
  item.deletedAt = getTimes();
  item.deletedById = Types.ObjectId(id);
  return item;
};
const updateFormat = ({ item = {}, id }) => {
  item.updated = true;
  item.updatedAt = getTimes();
  item.updatedById = Types.ObjectId(id);
  return item;
};

const isLink = (link) => {
  if (isString(link)) {
    if (link.startsWith("http") || link.startsWith("https")) return true;
    else return false;
  }
  return false;
};

// ********************************************************
module.exports = {
  writeData,
  rename,
  unlink,
  saveImg,
  saveImgs,
  errorHandling,
  isInt,
  isFloat,
  toFixed,
  encodingBase64,
  decodingBase64,
  formatDate,
  ISODate,
  setYear,
  getTime,
  getTimes,
  hideFields,
  getDataFromModelByQuery,
  getOneFromModelByQuery,
  deleteFormat,
  updateFormat,
  isLink,
};
