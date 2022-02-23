import pino from "pino";

export function createRootLogger({ level, file }) {
  return pino({
    name: "petibrugnon",
    timestamp: pino.stdTimeFunctions.isoTime,
    level: "trace",
    transport: {
      targets: [
        {
          target: "pino-pretty",
          level,
          options: {
            destination: 1,
            translateTime: "SYS:HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        },
        {
          target: "pino/file",
          level: "trace",
          options: { destination: file },
        },
      ],
    },
  });
}
