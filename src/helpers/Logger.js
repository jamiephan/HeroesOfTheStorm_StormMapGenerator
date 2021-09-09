const winston = require("winston")

const createLogger = service => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service },
    format: winston.format.combine(
      winston.format.simple(),
      winston.format.colorize(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    ],
  });

}


module.exports = createLogger