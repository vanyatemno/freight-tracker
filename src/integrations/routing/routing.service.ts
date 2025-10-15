import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IntegrationServices, RouteEndpoints } from './types';
import { RouteResults } from 'osrm';

@Injectable()
export class RoutingService {
  private readonly baseUrl = 'https://router.project-osrm.org';
  private readonly apiVersion = 'v1';
  private readonly context = 'routing-integration';

  constructor(private readonly logger: Logger) {}

  /**
   * Fetches the length of the shortest way for route.
   * @param route
   */
  public async getDistance(route: RouteEndpoints) {
    try {
      const url = this.buildDistanceUrl(route);
      const response = await fetch(url, { method: 'GET' });
      const data: RouteResults = await response.json();

      if (data.routes.length === 0) {
        this.logger.error(
          `Could not find the route for between specified coordinates: ${JSON.stringify(
            data,
          )}`,
        );
        throw new BadRequestException('Can not find route for this two points');
      }

      return data.routes[0].distance;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(
        `Failed to get distance for specified coordinates(${JSON.stringify(
          route,
        )}. Error: ${JSON.stringify(error)}`,
        null,
        this.context,
      );
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Builds the url for the OSRM to get shortest way length between two points.
   * @param route
   * @private
   */
  private buildDistanceUrl(route: RouteEndpoints) {
    const urlCoordinates = this.buildApiCoordinates(route);
    const url = new URL(
      `${this.baseUrl}/${IntegrationServices.ROUTE}/${this.apiVersion}/driving/${
        urlCoordinates
      }`,
    );
    url.searchParams.append('steps', 'false');
    url.searchParams.append('overview', 'false');

    return url;
  }

  /**
   * Builds endpoints string in the OSRM API format.
   * @param start
   * @param end
   * @private
   */
  private buildApiCoordinates({ start, end }: RouteEndpoints) {
    if (typeof start === 'object' && typeof end === 'object') {
      return `${start.lat},${start.long};${end.lat},${end.long}`;
    } else {
      return `${start};${end}`;
    }
  }
}
