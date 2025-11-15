# Morrow - AI-Powered Personal Finance Coach

## Overview

Morrow is a mobile-first personal finance and savings application that helps users build better money habits through AI-powered coaching, automated savings methods, and gamified challenges. The app features a warm, friendly design inspired by Cleo's aesthetic, with soft beige backgrounds, deep brown text, and warm orange accents optimized for iPhone (390×844).

The application provides comprehensive financial tooling including goal-based savings vaults with soft-lock protection, multiple intelligent savings strategies (round-ups, windfall detection, smart sweeps), behavioral challenges, and a reward system with prize-linked savings features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- shadcn/ui component library following the "new-york" style variant
- Custom design system based on Morrow brand guidelines (soft beige backgrounds, warm orange accents, deep brown text)

**Layout & Responsiveness**
- Mobile-first design approach optimized for 390px max-width with full viewport height
- Bottom navigation pattern for primary app navigation
- Full-screen mobile experience with no desktop breakpoints
- Onboarding carousel features auto-scrolling (4.5s intervals) with 9:16 optimized hero images

**State Management**
- TanStack Query for async state and API integration
- Local React state for UI interactions
- No global state management library (Redux, Zustand) currently implemented

**Routing Structure**
- `/onboarding` - Multi-step onboarding flow with auto-scrolling carousel (3 hero slides), money goals, personal details, email verification, and bank connection
- `/home` - Dashboard with account balances and quick actions
- `/vaults` - Goal-based savings management with vault detail views and soft-lock withdrawal protection
- `/savings-lab` - Savings methods configuration (9 methods: Windfall Wallet, Smart Sweep, Subscription Sweep, Round-ups, Challenges, Rules/Automations, Emotion-based Nudges, Save-to-Spend Loop, Fun Money Lottery)
- `/challenges` - Gamified savings challenges
- `/rewards` - Prize-linked savings and rewards tracking with Fun Money Wallet
- `/coach` - AI chat interface for financial coaching

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for HTTP server
- ESM (ECMAScript Modules) for modern JavaScript imports
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful API pattern with `/api` prefix for all endpoints
- Currently minimal route implementation (ready for expansion)
- Request/response logging middleware for debugging

**Storage Layer**
- Interface-based storage abstraction (IStorage)
- In-memory storage implementation (MemStorage) for development
- Designed to be swapped with PostgreSQL via Drizzle ORM
- User entity currently defined with username/password authentication schema

**Build & Deployment**
- esbuild for server bundling in production
- tsx for TypeScript execution in development
- Separate client and server build processes

### Data Storage Solutions

**Database Setup**
- Drizzle ORM configured for PostgreSQL
- Neon serverless PostgreSQL adapter (@neondatabase/serverless)
- Schema-first approach with TypeScript type generation
- Migration system via drizzle-kit

**Schema Design**
- Users table with UUID primary keys, username/password fields
- Zod integration for runtime validation via drizzle-zod
- Prepared for expansion with vaults, transactions, savings methods, and challenges tables

**Session Management**
- Express session support configured (connect-pg-simple for PostgreSQL session store)
- Cookie-based authentication ready to implement

### Authentication & Authorization

**Current State**
- User schema defined with username/password fields
- No active authentication implementation
- Session middleware configured but not enforced

**Planned Implementation**
- Email-based signup with verification code flow (UI components exist)
- Password hashing (bcrypt or argon2)
- Session-based authentication with PostgreSQL session store
- Protected routes for authenticated users

### External Dependencies

**Third-Party Integrations (Planned)**
- Plaid for bank account connectivity (placeholder UI implemented)
- AI/LLM service for coach chatbot functionality
- Email service for verification codes and notifications

**UI Libraries & Components**
- Radix UI suite for accessible component primitives (accordion, dialog, dropdown, popover, slider, switch, tabs, toast, etc.)
- Embla Carousel for onboarding slides
- Lucide React for consistent iconography
- date-fns for date manipulation
- cmdk for command palette patterns

**Development Tools**
- TypeScript for type safety across stack
- Tailwind CSS with PostCSS for styling
- Vite plugins: runtime error overlay, Replit cartographer (dev), dev banner (dev)

**Banking & Financial Services**
- Plaid integration architecture designed (BankConnection component ready)
- Bank account linking flow in onboarding
- Read-only access pattern with bank-level encryption messaging

**AI & Machine Learning**
- AI Coach chat interface built (CoachTab component)
- Personalized savings recommendations architecture
- Spending pattern analysis hooks (to be implemented)

**Future Integrations**
- Prize draw service for rewards program
- Push notification service
- Analytics and event tracking
- Email/SMS providers for transactional messages