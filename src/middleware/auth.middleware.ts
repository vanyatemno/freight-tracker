import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { AUTH_CONFIG_NAME } from '../infrastracture';

/**
 * Basic authorization middleware based on static API key.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly apiKey: string;
  private readonly context = 'Auth';

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    const { apiKey } = this.configService.get(AUTH_CONFIG_NAME);
    this.apiKey = apiKey;
  }

  /**
   * Implementation of basic authentication.
   * @param req
   * @param res
   * @param next
   */
  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (!token) {
      this.logger.error(
        `Attempt to access route with no auth token. URL: ${req.url}`,
        null,
        this.context,
      );
      throw new UnauthorizedException('No authorization token provided');
    }

    if (token === this.apiKey) {
      return next();
    }

    this.logger.error(
      `Attempt to access route with invalid auth token. URL: ${req.url}`,
      null,
      this.context,
    );
    throw new UnauthorizedException('Invalid token');
  }

  /**
   * Extracts bearer token out of request.
   * @param req
   * @private
   */
  private extractToken(req: Request) {
    const authHeader = req.headers?.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }
}
