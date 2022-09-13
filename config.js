const isProduction = () => {
  const env = process.env.NODE_ENV || "development";
  const isProduction = env === "production";
  return isProduction;
};

const getEnvironments = () => {
  if (isProduction())
    return process.env.APP_BASE_URL_PRODUCTION ? process.env.APP_BASE_URL_PRODUCTION : "production_env_not_found";
  else if (!isProduction())
    return process.env.APP_BASE_URL_DEVELOPMENT ? process.env.APP_BASE_URL_DEVELOPMENT : "development_env_not_found";

  return "unknown_env";
};

const config = {
  APP_NAME: "UPLOADER",
  API_ROOT: getEnvironments(),
  DEFAULT_LANG_CODE: "uz",
  PROJECT_ID: 1,
  PORT: process.env.PORT,
  DELETE_ALL_FILES_PATH: isProduction()
    ? process.env.DELETE_ALL_FILES_PATH_PRODUCTION
    : process.env.DELETE_ALL_FILES_PATH_DEVELOPMENT,
  IMAGES_PATH: isProduction() ? process.env.IMAGES_PATH_PRODUCTION : process.env.IMAGES_PATH_DEVELOPMENT,
  CACHE_PATH: isProduction() ? process.env.CACHE_PATH_PRODUCTION : process.env.CACHE_PATH_DEVELOPMENT,
  DATA_PATH: isProduction() ? process.env.DATA_PATH_PRODUCTION : process.env.DATA_PATH_DEVELOPMENT,
};

module.exports = config;
