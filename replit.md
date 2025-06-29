# Fitness Tracker Application

## Overview

This is a full-stack fitness tracking application built with React frontend and Express backend. The application helps users track their workouts, nutrition, and progress with AI-powered recommendations. It features a modern UI built with shadcn/ui components and uses PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Integration**: OpenAI for AI-powered workout and meal recommendations

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: User profiles with fitness goals and targets
- **Exercises**: Exercise database with categories and instructions
- **Workouts**: User workout plans with exercises and completion tracking
- **Food Items**: Nutritional database for meal tracking
- **Meal Entries**: Daily food intake logging
- **Progress Entries**: Weight and fitness progress tracking
- **Workout Sessions**: Completed workout session records

### API Structure
The backend provides RESTful endpoints for:
- Authentication (register/login)
- User management and profile updates
- Workout generation and management
- Nutrition tracking and meal logging
- Progress tracking and analytics
- AI-powered recommendations

### Frontend Pages
- **Dashboard**: Overview of daily calories, workouts, and progress
- **Workouts**: AI-generated workout plans based on fitness goals
- **Nutrition**: Meal tracking with macro counting
- **Progress**: Weight tracking and achievement visualization

## Data Flow

1. **User Authentication**: Simple username/password authentication stored in PostgreSQL
2. **Workout Generation**: OpenAI integration creates personalized workout plans based on user profile
3. **Nutrition Tracking**: Users log meals, system calculates macronutrients against daily targets
4. **Progress Monitoring**: Weight and measurement tracking with visual progress indicators
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache management

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL-compatible serverless database)
- **AI Service**: OpenAI API for workout and meal plan generation
- **UI Components**: Radix UI primitives for accessible component foundation
- **Validation**: Zod for runtime type checking and validation

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Drizzle Kit**: Database schema management and migrations
- **Vite**: Fast development server with HMR
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Build Process
- Frontend: Vite builds static assets to `dist/public`
- Backend: esbuild bundles Node.js application to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **OPENAI_API_KEY**: OpenAI API key for AI features
- **NODE_ENV**: Environment specification (development/production)

### Architecture Decisions

**Database Choice**: PostgreSQL was chosen for its robust relational capabilities, essential for complex fitness data relationships. Neon Database provides serverless scaling without compromising PostgreSQL compatibility.

**ORM Selection**: Drizzle ORM provides type-safe database operations with excellent TypeScript integration, reducing runtime errors and improving developer experience.

**Frontend Framework**: React with Vite offers fast development cycles and excellent ecosystem support. TanStack Query handles complex server state scenarios common in fitness applications.

**UI Framework**: shadcn/ui provides production-ready components built on accessible Radix UI primitives, ensuring consistent design and accessibility compliance.

**AI Integration**: OpenAI integration enables personalized workout and nutrition recommendations, adding significant value to the user experience.

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```