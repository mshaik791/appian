# OxbridgEducation

A production-ready Next.js 14 application with TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth, Redis, and comprehensive testing setup.

## Features

- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **Prisma** with PostgreSQL for database management
- **NextAuth** with Email/Password provider and role support
- **Redis** client for caching and session management
- **ESLint & Prettier** for code quality
- **Vitest** for unit testing
- **Playwright** for end-to-end testing
- **GitHub Actions** CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis server

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd oxbridgeducation
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env.local` with your configuration:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oxbridgeducation
REDIS_URL=redis://localhost:6379
HEYGEN_API_KEY=your-heygen-api-key
```

**Required Environment Variables:**
- `HEYGEN_API_KEY`: Your HeyGen API key for avatar streaming functionality
  - Get it from: https://app.heygen.com/settings/api-keys

4. Set up the database:
```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

2. **Run database migrations and seed:**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Login with test accounts:**
   - Faculty: `faculty@oxbridgeducation.dev` / `Password123!`
   - Student: `student@oxbridgeducation.dev` / `Password123!`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run test:e2e:ui` - Run e2e tests with UI
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database
- `npm run check-db` - Check database connection

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Prisma client
│   ├── redis.ts        # Redis client
│   └── utils.ts        # Utility functions
├── drivers/            # External service drivers
├── test/               # Test setup and utilities
└── types/              # TypeScript type definitions
```

## Authentication

The application uses NextAuth with a credentials provider for development. Default credentials:
- Email: `admin@example.com`
- Password: `password`

## Database Schema

The Prisma schema includes:
- User model with role support (USER, ADMIN)
- NextAuth required models (Account, Session, VerificationToken)

## Testing

### Unit Tests
Tests are located in `src/test/` and use Vitest with jsdom environment.

### E2E Tests
End-to-end tests are in `tests/` and use Playwright.

## CI/CD

GitHub Actions workflow includes:
- Linting and type checking
- Unit tests
- E2E tests
- Database setup with PostgreSQL and Redis services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
