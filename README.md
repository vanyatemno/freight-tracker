# Freight Tracker

Freight Tracker is a NestJS application for managing freight carriers and their routes. It provides a RESTful API to create, read, update, and delete carriers and routes, and to assign carriers to routes.

## How to Bootstrap Project

### Prerequisites

- Node.js (v18 or higher)
- npm (or yarn/pnpm)
- PostgreSQL

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd freight-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the environment file:**
    Create a `.env` file in the root of the project and add the following environment variables. You can use the `.env.example` file as a template.

    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
    PORT=3000
    ```

4.  **Run database migrations:**
    This will create the necessary tables in your database.
    ```bash
    npm run db:migrate
    ```

5.  **(Optional) Seed the database:**
    This will populate the database with some initial data.
    ```bash
    npm run db:seed
    ```

### Running the Project

-   **Development mode:**
    ```bash
    npm run start:dev
    ```
    The application will be available at `http://localhost:3000`.

-   **Production mode:**
    ```bash
    npm run build
    npm run start:prod
    ```

## Project Details

### Folder Structure

```
.
├── prisma/              # Database schema, migrations, and seed script
├── src/                 # Application source code
│   ├── api/             # Core business logic
│   │   ├── domain/      # Business domains (e.g., carrier, route)
│   │   └── shared/      # Shared DTOs and utilities
│   ├── infrastracture/  # Infrastructure-related code
│   │   ├── config/      # Application configuration
│   │   ├── database/    # Database services (Prisma)
│   │   └── logger/      # Logging services
│   ├── integrations/    # Integrations with external services
│   ├── middleware/      # Custom middleware
│   └── shared/          # Shared utilities and enums
├── docs/                # Documentation files
└── ...
```

### Database Structure

The database schema is defined using Prisma and consists of two main models: `Carrier` and `Route`.

-   **`Carrier`**: Represents a freight vehicle.
    -   `id`: Unique identifier for the carrier.
    -   `licensePlate`: Unique license plate of the vehicle.
    -   `model`: The model of the vehicle.
    -   `type`: The type of carrier (e.g., `MINI`, `BOX`, `REFRIGERATED`).
    -   `registrationDate`: The date the carrier was registered.
    -   `status`: The current availability status of the carrier (`AVAILABLE` or `BUSY`).
    -   `rate`: The rate for using the carrier, stored in EUR.
    -   `routes`: A list of routes assigned to this carrier.

-   **`Route`**: Represents a freight route.
    -   `id`: Unique identifier for the route.
    -   `startPoint`: The starting location of the route.
    -   `endPoint`: The destination of the route.
    -   `distance`: The total distance of the route in meters.
    -   `requiredCarrierType`: The specific type of carrier required for this route.
    -   `status`: The current status of the route (`AWAITING_DISPATCH`, `IN_PROGRESS`, `COMPLETED`).
    -   `price`: The price offered for completing the route.
    -   `carrierFee`: The fee paid to the carrier for this route.
    -   `departureDate`: The planned departure date and time.
    -   `completionDate`: The planned completion date and time.
    -   `departureDateActual`: The actual departure date and time.
    -   `completionDateActual`: The actual completion date and time.
    -   `carrier`: A relation to the `Carrier` model, representing the carrier assigned to the route.

### API Documentation

The API is documented using Swagger and Postman.

-   **Swagger UI**: The interactive API documentation can be accessed at the `/openapi` endpoint.
-   **Postman Collection**: A Postman collection is available in the `./docs` folder for easy testing of the API endpoints.

## Main Business Logic

The main business logic revolves around two entities: `Carrier` and `Route`.

-   A `Carrier` represents a vehicle that can be assigned to a route. It has properties like license plate, model, type, and status (AVAILABLE or BUSY).
-   A `Route` represents a journey from a start point to an end point. It has properties like distance, required carrier type, price, and status (AWAITING_DISPATCH, IN_PROGRESS, COMPLETED).

### User Interaction Flow

The following sequence diagram illustrates the main user interaction flow, focusing on the process of creating a carrier, creating a route, and assigning the carrier to the route.

```mermaid
sequenceDiagram
    participant User
    participant API

    User->>API: POST /carriers (Create a new carrier)
    API-->>User: 201 Created (Carrier details)

    User->>API: POST /routes (Create a new route)
    API-->>User: 201 Created (Route details)

    User->>API: PUT /routes/{routeId}/carrier (Assign carrier to route)
    API->>API: Check if carrier is available
    alt Carrier is available
        API->>API: Update carrier status to 'BUSY'
        API->>API: Update route status to 'IN_PROGRESS'
        API-->>User: 200 OK (Updated route details)
    else Carrier is not available
        API-->>User: 400 Bad Request (Error message)
    end

    User->>API: PUT /routes/{routeId}/status (Update route status, departure/arrival time)
    API->>API: Update route details in database
    API-->>User: 200 OK (Updated route details)
```
