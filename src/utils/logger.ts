import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
});

const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/debug.log",
      level: "debug",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/verbose.log",
      level: "verbose",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/silly.log",
      level: "silly",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
    })
  );
}

export { logger };
