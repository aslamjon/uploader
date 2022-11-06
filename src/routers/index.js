const { Router } = require("express");
const multer = require("multer");
const config = require("../../config");
const { createDefaultFolder } = require("../utils/utiles");
const { uploadFile, uploadList, downloadFile, deleteFile } = require("../controllers/uploadContainer");

const router = Router();

createDefaultFolder(config.CACHE_PATH);

// you might also want to set some limits: https://github.com/expressjs/multer#limits
const upload = multer({ dest: config.CACHE_PATH });

/* name attribute of <file> element in your form */
const nameOfFileFromFrontend = upload.any();

router.post("/", nameOfFileFromFrontend, uploadFile);
router.get("/list", uploadList);
router.get("/file/:id", downloadFile);
router.delete("/file/:id", deleteFile);

module.exports = {
  uploadRouter: router,
};
