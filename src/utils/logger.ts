import winston from "winston";

const winston_logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "logs/debug.log",
      level: "debug",
    }),
    new winston.transports.File({
      filename: "logs/verbose.log",
      level: "verbose",
    }),
    new winston.transports.File({
      filename: "logs/silly.log",
      level: "silly",
    }),
    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
    }),
  ],
});

const no_logger = (props: any) => {};

const logger =
  process.env.NODE_ENV !== "production" ? winston_logger : no_logger;

export { logger };
