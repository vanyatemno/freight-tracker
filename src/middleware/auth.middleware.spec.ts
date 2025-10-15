import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from './auth.middleware';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { NextFunction } from 'express';
import { AUTH_CONFIG_NAME } from '../infrastracture';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let logger: Logger;
  let _configService: ConfigService;

  const apiKey = 'test-api-key';
  const { res, mockClear } = getMockRes();

  beforeEach(async () => {
    mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === AUTH_CONFIG_NAME) {
                return { apiKey };
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    logger = module.get<Logger>(Logger);
    _configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw UnauthorizedException if no auth token is provided', async () => {
    const req = getMockReq();
    const next: NextFunction = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      new UnauthorizedException('No authorization token provided'),
    );
    expect(logger.error).toHaveBeenCalledWith(
      `Attempt to access route with no auth token. URL: ${req.url}`,
      null,
      'Auth',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is not a bearer token', async () => {
    const req = getMockReq({
      headers: { authorization: 'Basic some-token' },
    });
    const next: NextFunction = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      new UnauthorizedException('No authorization token provided'),
    );
    expect(logger.error).toHaveBeenCalledWith(
      `Attempt to access route with no auth token. URL: ${req.url}`,
      null,
      'Auth',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const req = getMockReq({
      headers: { authorization: 'Bearer invalid-token' },
    });
    const next: NextFunction = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
    expect(logger.error).toHaveBeenCalledWith(
      `Attempt to access route with invalid auth token. URL: ${req.url}`,
      null,
      'Auth',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if token is valid', async () => {
    const req = getMockReq({
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const next: NextFunction = jest.fn();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
