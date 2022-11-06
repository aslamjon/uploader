const mongoose = require("mongoose");
const config = require("../../../config");
const logger = require("./../../utils/logger");

function connectDb() {
  mongoose
    .connect(config.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      logger.info("Mongodb is connected");
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = {
  connectDb,
};
