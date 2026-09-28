# GeoPoint — POI Map Application (Turborepo Monorepo)

A full-stack, production-grade Points of Interest (POI) management system built with **Turborepo**, **NestJS**, **SQLite + TypeORM**, and **React + Leaflet**.

---

## Table of Contents

1. [What Turborepo Is](#1-what-turborepo-is)
2. [Project Structure](#2-project-structure)
3. [How the NestJS API Works](#3-how-the-nestjs-api-works)
4. [How SQLite Is Used](#4-how-sqlite-is-used)
5. [What CRUD Means](#5-what-crud-means)
6. [How React Router Is Used](#6-how-react-router-is-used)
7. [How Leaflet Works](#7-how-leaflet-works)
8. [How Frontend and Backend Communicate](#8-how-frontend-and-backend-communicate)
9. [Installation Commands](#9-installation-commands)
10. [How to Run the Project](#10-how-to-run-the-project)

---

## 1. What Turborepo Is

**Turborepo** is a high-performance build system for JavaScript and TypeScript monorepos. 

In a traditional multi-project setup, you might manage separate Git repositories or run disparate npm scripts in distinct folders. Turborepo supercharges development by organizing related applications and packages inside a single monorepo repository while offering:

- **Intelligent Task Orchestration**: Turborepo understands the dependency graph between your packages. If `apps/web` or `apps/api` depends on `packages/shared`, Turbo builds `shared` before building the apps.
- **Incremental Builds and Computation Caching**: If code hasn't changed, Turborepo skips running tests or builds again and immediately serves results from its cache.
- **Parallel Execution**: Tasks that are independent (like running the Vite dev server and the NestJS dev server) are scheduled to execute concurrently in parallel streams.
- **Single Developer Command**: A single command (`npm run dev` at the root) coordinates watch tasks across all workspaces.

---

## 2. Project Structure

The project utilizes **npm workspaces** configured in `package.json` alongside Turborepo pipeline settings defined in `turbo.json`:

```text
turbereo-poi-map-app/
├── package.json              # Root package definition & npm workspaces configuration
├── turbo.json                # Turborepo task pipeline (build, dev, lint)
├── packages/
│   └── shared/               # Shared TypeScript types & contracts
│       ├── package.json      # @poi/shared package
│       ├── tsconfig.json
│       └── src/
│           └── index.ts      # Poi entity, CreatePoiDto, UpdatePoiDto, seed data
├── apps/
│   ├── api/                  # NestJS Backend Application
│   │   ├── package.json      # @poi/api (NestJS, TypeORM, SQLite3, class-validator)
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts       # Application bootstrap, CORS, ValidationPipe
│   │       ├── app.module.ts # Root module with TypeORM SQLite connection
│   │       └── pois/
│   │           ├── poi.entity.ts           # TypeORM database entity
│   │           ├── pois.controller.ts     # REST routes (/pois, /pois/:id)
│   │           ├── pois.service.ts        # Business logic & repository operations
│   │           ├── pois.module.ts         # Module encapsulation
│   │           └── dto/
│   │               ├── create-poi.dto.ts  # Validation decorators for POST
│   │               └── update-poi.dto.ts  # Validation decorators for PATCH
│   └── web/                  # React Frontend Application
│       ├── package.json      # @poi/web (Vite, React 18, React Router, Leaflet)
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx      # React DOM bootstrap & Leaflet icon configuration
│           ├── App.tsx       # Root component & Route providers
│           ├── index.css     # Modern design system & dark glass styling
│           ├── context/
│           │   └── PoiContext.tsx         # Global state (pois, selectedPoi, toasts)
│           ├── services/
│           │   └── poiApi.ts              # Typed fetch API client
│           ├── components/
│           │   ├── Header.tsx             # Navigation header & API status badge
│           │   ├── PoiSidebar.tsx         # Searchable list of POIs
│           │   ├── PoiMap.tsx             # Interactive Leaflet map & custom markers
│           │   ├── DeleteConfirmModal.tsx # Confirmation modal dialog
│           │   └── Toast.tsx              # Toast alert feedback
│           └── pages/
│               ├── MapView.tsx            # Main layout dashboard
│               ├── PoiNewModal.tsx        # Add POI route (/pois/new)
│               └── PoiEditModal.tsx       # View/Edit POI route (/pois/:id)
```

---

## 3. How the NestJS API Works

**NestJS** is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications using TypeScript.

### NestJS Architecture Components

1. **Modules (`@Module`)**:
   Modules organize application boundaries into cohesive blocks. `AppModule` is the root module, while `PoisModule` groups all POI-related controllers and providers.
2. **Controllers (`@Controller('pois')`)**:
   Controllers handle incoming HTTP client requests and return responses:
   - `@Get()` maps to `GET /pois`
   - `@Get(':id')` maps to `GET /pois/:id`
   - `@Post()` maps to `POST /pois`
   - `@Patch(':id')` maps to `PATCH /pois/:id`
   - `@Delete(':id')` maps to `DELETE /pois/:id`
3. **Services (`@Injectable()`)**:
   Services isolate data persistence and business logic away from route definitions. `PoisService` injects the TypeORM `Repository<PoiEntity>` to run queries against SQLite.
4. **Data Transfer Objects (DTOs) & Validation**:
   NestJS validates incoming request bodies before they reach the controller methods using `ValidationPipe`, `class-validator`, and `class-transformer`:
   - `@IsNotEmpty()`, `@IsString()`, `@IsNumber()`, `@Min(-90)`, `@Max(90)`, `@Min(-180)`, `@Max(180)`.
5. **CORS & Lifecycle**:
   In `main.ts`, `app.enableCors({ origin: '*' })` allows the React Vite frontend to communicate without cross-origin browser security restrictions.

---

## 4. How SQLite Is Used

**SQLite** is a self-contained, serverless, zero-configuration SQL database engine.

- **Zero Setup**: Unlike PostgreSQL or MySQL, SQLite requires no daemon, background service, or credentials. The database is stored entirely in a local file (`poi.sqlite`).
- **TypeORM Integration**:
  In `apps/api/src/app.module.ts`:
  ```typescript
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: path.resolve(__dirname, '..', 'poi.sqlite'),
    entities: [PoiEntity],
    synchronize: true, // Automatically creates tables and columns on startup
  })
  ```
- **Automatic Initialization**:
  When the NestJS API starts for the first time:
  1. SQLite creates `poi.sqlite` if it doesn't already exist.
  2. TypeORM creates the `pois` table matching the schema of `PoiEntity`.
  3. `PoisService.onModuleInit()` checks whether the database is empty; if so, it seeds a collection of world landmarks (Eiffel Tower, Colosseum, Statue of Liberty, Tokyo Skytree, Sydney Opera House, Taj Mahal) for immediate interaction.

---

## 5. What CRUD Means

**CRUD** is an acronym for the four fundamental operations performed on persistent storage:

| Operation | HTTP Verb | Endpoint | Purpose |
|:---|:---|:---|:---|
| **C**reate | `POST` | `/pois` | Adds a new POI record to the database with a generated UUID |
| **R**ead | `GET` | `/pois`<br>`/pois/:id` | Retrieves all POIs or a specific POI by its ID |
| **U**pdate | `PATCH` | `/pois/:id` | Modifies existing fields (e.g. name, description, latitude, longitude) |
| **D**elete | `DELETE` | `/pois/:id` | Removes the POI from SQLite and confirms deletion |

---

## 6. How React Router Is Used

**React Router (v6)** manages client-side navigation without triggering full browser page reloads.

In this project, client-side routing is organized with modal-preserving overlay routes:
- `/` — Displays the primary dashboard with the interactive Leaflet map and POI sidebar.
- `/pois/new` — Displays the "Add Point of Interest" form while **keeping the Leaflet map live and visible in the background**, allowing users to click anywhere on the map to automatically populate latitude and longitude!
- `/pois/:id` — Displays the "Edit Point of Interest" form preloaded with data, allowing users to tweak details or click the map to reposition the pin.

React Router hooks used:
- `useNavigate()`: Programmatically navigates between routes after actions (e.g., navigating to `/` upon successful creation or cancellation).
- `useParams()`: Extracts `:id` from the URL inside `/pois/:id`.
- `useLocation()`: Determines whether creation or edit mode is active.

---

## 7. How Leaflet Works

**Leaflet** is an open-source JavaScript library for mobile-friendly interactive maps. **React Leaflet** provides React component wrappers over Leaflet objects.

### Key Components

- **`MapContainer`**: The root map element that initializes the Leaflet map engine, coordinates, and default zoom level.
- **`TileLayer`**: Fetches and renders map raster tiles (from OpenStreetMap).
- **`Marker`**: Places a pinpoint at specific latitude/longitude coordinates.
  - Custom pins are rendered using `L.divIcon`, creating SVG-styled pins with gradient glow effects.
- **`Popup`**: Displays an info window when a marker is clicked:
  - Displays the POI name, description, and formatted coordinates.
  - Houses the **Edit** and **Delete** action buttons.
- **`useMapEvents` (Map Click Coordinate Picker)**:
  Captures click events anywhere on the canvas:
  ```typescript
  useMapEvents({
    click(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));
      // Updates state and populates the form coordinates automatically!
    }
  });
  ```
- **`useMap` (Smooth Fly-To Animation)**:
  `map.flyTo([lat, lng], zoom, { duration: 1.2 })` provides smooth animations when a user clicks a card in the sidebar.

---

## 8. How Frontend and Backend Communicate

Communication between the React frontend and NestJS backend follows a RESTful pattern:

```text
[ Browser / React App ] (Port 5173)
         │
         │  HTTP Requests (fetch via apps/web/src/services/poiApi.ts)
         ▼
[ NestJS REST API ]     (Port 3001)
         │
         │  TypeORM Repository Queries
         ▼
[ SQLite Database ]     (poi.sqlite)
```

1. **Service Layer Abstraction (`apps/web/src/services/poiApi.ts`)**:
   API calls are isolated from UI components in a typed service module. It handles base URLs, JSON headers, and descriptive error messages.
2. **State Management (`PoiContext.tsx`)**:
   When the API responds to a `POST`, `PATCH`, or `DELETE`, the React state is updated in memory immediately. This ensures that markers and cards reflect changes **without needing a page refresh**.
3. **CORS (Cross-Origin Resource Sharing)**:
   Since the React application runs on port `5173` and the API runs on port `3001`, NestJS configures `app.enableCors()` to allow communication between both ports.

---

## 9. Installation Commands

Clone the repository and install all dependencies from the root directory:

```bash
# Clone the repository
git clone <repo-url>
cd turbereo-poi-map-app

# Install all workspace dependencies (root, apps/api, apps/web, packages/shared)
npm install
```

---

## 10. How to Run the Project

### Running in Development Mode

Run the following command from the root directory:

```bash
npm run dev
```

Turborepo will concurrently start:
- **`@poi/shared`**: TypeScript watcher compiling types into `dist/`
- **`@poi/api`**: NestJS development server on [http://localhost:3001](http://localhost:3001)
- **`@poi/web`**: Vite development server on [http://localhost:5173](http://localhost:5173)

Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the map!

### Building for Production

To compile all packages and applications with Turborepo:

```bash
npm run build
```

### Running Linter / Typechecks

To verify TypeScript types and lint across all workspaces:

```bash
npm run lint
```
