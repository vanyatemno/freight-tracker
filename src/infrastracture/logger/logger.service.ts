import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { utilities } from 'nest-winston';

export class LoggerFactory {
  static create(appName: string) {
    const consoleFormat = format.combine(
      format.timestamp(),
      format.ms(),
      utilities.format.nestLike(appName, {
        colors: true,
        prettyPrint: true,
      }),
    );

    return createLogger({
      level: 'info',
      transports: [new transports.Console({ format: consoleFormat })],
    });
  }
}

@Injectable()
export class LoggerService {}
