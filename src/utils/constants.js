const config = require("../../config");

const errorFormat = {
  SERVER_ERROR: { error: "SERVER_ERROR" },
  SEND_FILE_TO_FILE_FEILD: { error: "SEND_FILE_TO_FILE_FEILD" },
  FILE_SIZE_HAS_EXCEEDED_LIMIT: {
    error: `FILE_SIZE_HAS_EXCEEDED_LIMIT. File limit ${config.LIMIT_FOR_UPLOADING_FILE_SIZE_IN_BAYTE / 1024} kb or ${
      config.LIMIT_FOR_UPLOADING_FILE_SIZE_IN_BAYTE / 1024 / 1024
    } mb`,
  },
  FILE_NOT_DELETED_FROM_CACHE: { error: "file not deleted from cache" },
  FILE_NOT_RENAMED: { error: "file not renamed" },
  FILES_NOT_FOUND: { error: "files not found" },
};

const errors = {
  SERVER_ERROR: (res, message) => res.status(500).send({ ...errorFormat.SERVER_ERROR, ...message }),
  SEND_FILE_TO_FILE_FEILD: (res, message) => res.status(400).send({ ...errorFormat.SEND_FILE_TO_FILE_FEILD, ...message }),
  FILE_SIZE_HAS_EXCEEDED_LIMIT: (res, message) =>
    res.status(400).send({ ...errorFormat.FILE_SIZE_HAS_EXCEEDED_LIMIT, ...message }),
  FILE_NOT_DELETED_FROM_CACHE: (res, message) => res.status(500).send({ ...errorFormat.FILE_NOT_DELETED_FROM_CACHE, ...message }),
  FILE_NOT_RENAMED: (res, message) => res.status(500).send({ ...errorFormat.FILE_NOT_RENAMED, ...message }),
  FILES_NOT_FOUND: (res, message) => res.status(500).send({ ...errorFormat.FILES_NOT_FOUND, ...message }),
  ONLY_FILE_ALLOWED: (res, message) => res.status(400).send({ error: `Only ${message} files allowed!` }),
};
module.exports = {
  errorFormat,
  errors,
};
