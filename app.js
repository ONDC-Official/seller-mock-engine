require("dotenv").config()

const express = require("express");
const log = require("./utils/logger");
const app = express();

const config = require("./utils/config.js");
const router = require("./routes/route");

const args = process.argv.slice(2);

if (args[0]) {

  const path = args[0];
  const file = `./${path}/${path}.yaml`;

  startUp(file);  
}
else{
  console.log("Please pass yaml configuration name")
}

//After instuctionSet completion, read response here
async function startUp(file) {
  await config.loadConfig(file);
  const server = config.getServer();
  const PORT = process.env.PORT || server.port

  app.use(express.json());
  const logger = log.init();

  app.listen(PORT, () => {
    logger.info(`This app is running on port number : ${PORT}`);
  });
  app.use(router);
}

