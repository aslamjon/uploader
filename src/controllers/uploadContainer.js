const config = require("../../config");
const fs = require("fs");
const { isEmpty, head, get } = require("lodash");
const { errors } = require("../utils/constants");
const {
  errorHandling,
  createDefaultFolder,
  rename,
  unlink,
  getExtension,
  getDataFromModelByQuery,
  getOneFromModelByQuery,
  isHasFile,
  deleteFormat,
} = require("../utils/utiles");
const moment = require("moment");
const path = require("path");
const { FileModel: DBModle } = require("../model/fileModel");

const fileName = require("path").basename(__filename);

const getDataByQuery = ({ query = {}, Model = DBModle } = {}) => getDataFromModelByQuery({ Model, query });
const getOneByQuery = ({ query = {}, Model = DBModle } = {}) => getOneFromModelByQuery({ Model, query });

const ifNotUserId = "63672f0eae08b1ccdd251a9c";

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send({ error: "id is required " });
    const query = { _id: id };
    const items = await getOneByQuery({ query });
    const filePath = get(items, "path");
    if (!isHasFile(filePath)) return res.status(404).send({ error: "file not found" });
    res.status(200).download(filePath);
  } catch (e) {
    errorHandling(e, downloadFile.name, res, fileName);
  }
};

const uploadList = async (req, res) => {
  try {
    fs.readdir(config.DATA_PATH, function (err, files) {
      if (err) {
        res.send({ error: "Unable to scan directory" });
        return console.log("Unable to scan directory: " + err);
      }
      res.send(files);
    });
  } catch (e) {
    errorHandling(e, uploadList.name, res, fileName);
  }
};

let accept_type = [];
const uploadFile = async (req, res) => {
  try {
    if (isEmpty(req.files)) {
      errors.FILES_NOT_FOUND(res);
      return {};
    }

    let file = head(req.files);
    if (get(file, "fieldname") === "file") {
      if (file.size <= config.LIMIT_FOR_UPLOADING_FILE_SIZE_IN_BAYTE) {
        const cacheFilePath = file.path;
        let originalName = file.originalname;

        function addDateTime(name, other = "", id = "") {
          const newDate = moment();
          const orginalNameArr = name.split(".");
          const fileType = orginalNameArr.pop();
          const getDate = newDate.format("DD-MM-YYYY");
          const getTime = newDate.format("HH.mm.ss.SSS");
          orginalNameArr.push(`_${id}_${getDate}_${getTime}${other}.${fileType}`);
          return orginalNameArr.join("");
        }

        const now = moment();
        const currentYear = now.year();
        const currentMonthName = now.format("MMMM");
        const dayOfMonth = now.date();

        // originalName = addDateTime(originalName, `__${req.user.userId}`);
        originalName = addDateTime(originalName, ``);

        let newPath = `${config.DATA_PATH}/${currentYear}/${currentMonthName}/${dayOfMonth}`;
        createDefaultFolder(newPath);

        const targetPath = `${newPath}/${originalName}`;

        // Create Img
        if (isEmpty(accept_type) || accept_type.includes(path.extname(file.originalname).toLowerCase())) {
          const resultRename = await rename(cacheFilePath, targetPath);
          if (!resultRename) errors.FILE_NOT_RENAMED(res);
          else {
            let newFile = new DBModle({
              name: originalName,
              orginalName: file.originalname,
              contentType: file.mimetype,
              size: file.size,
              extension: getExtension(file),
              path: targetPath,
              createdById: get(req, "user.userId", ifNotUserId),
            });
            newFile.url = `upload/file/${newFile._id.toString()}`;
            await newFile.save();

            return res.send({ data: newFile });
          }
        } else {
          // Delete cache
          const resUnlik = await unlink(cacheFilePath);
          if (!resUnlik) errors.FILE_NOT_DELETED_FROM_CACHE(res);
          else errors.ONLY_FILE_ALLOWED(res, accept_type.join(", "));
        }
      } else errors.FILE_SIZE_HAS_EXCEEDED_LIMIT(res);
    } else errors.SEND_FILE_TO_FILE_FEILD(res);
  } catch (e) {
    errorHandling(e, uploadFile.name, res, fileName);
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { _id: id };

    if (!id) return res.status(400).send({ error: "id is required" });
    const data = await getOneByQuery({ query });
    if (!data) res.status(404).send({ error: "file is not found" });
    else {
      let newData = await deleteFormat({ item: data, id: get(req, "user.userId", ifNotUserId) });

      const now = moment();
      const currentYear = now.year();
      const currentMonthName = now.format("MMMM");
      const dayOfMonth = now.date();

      let newPath = `${config.DELETE_ALL_FILES_PATH}/${currentYear}/${currentMonthName}/${dayOfMonth}`;
      createDefaultFolder(newPath);

      const targetPath = `${newPath}/${get(newData, "name")}`;

      const resultRename = await rename(get(newData, "path"), targetPath);
      if (!resultRename) errors.FILE_NOT_RENAMED(res);
      else {
        newData.path = targetPath;
        await newData.save();

        res.send({ message: "file has been deleted" });
      }
    }
  } catch (e) {
    errorHandling(e, deleteFile.name, res, fileName);
  }
};

module.exports = {
  downloadFile,
  uploadList,
  uploadFile,
  deleteFile,
};
