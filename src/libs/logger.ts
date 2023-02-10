import winston from 'winston'

const colorizer = winston.format.colorize()

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((msg) =>
      colorizer.colorize(
        msg.level,
          `${msg.timestamp} - ${msg.level}: ${msg.message}`
      )
    ),
    winston.format.errors({ stack: true })
  ),
  transports: [new winston.transports.Console()]
})
