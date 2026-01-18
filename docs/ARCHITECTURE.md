# Architecture Documentation

## Overview

LegallyAI is a modern legal tech platform built with a serverless architecture, leveraging React for the frontend and Supabase for the backend.

## Technology Stack

### Frontend
- **Framework:** React 18.3
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 5.4
- **UI Components:** shadcn-ui (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router DOM 6.30
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend
- **BaaS:** Supabase
  - PostgreSQL Database
  - Authentication & Authorization
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Storage (S3-compatible)
  - Real-time subscriptions

### Mobile
- **Framework:** Capacitor 8.0
- **Platforms:** iOS, Android
- **Build:** Native platform tools (Xcode, Gradle)

### DevOps
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel / Netlify
- **Version Control:** Git + GitHub
- **Package Manager:** npm

## Project Structure

```
legallyai-nexus-4b3048fb/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn-ui components
│   │   └── ...             # Custom components
│   ├── pages/              # Page components (routes)
│   ├── lib/                # Utility functions
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client & hooks
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles
│   └── App.tsx             # Main app component & routing
├── supabase/
│   ├── functions/          # Edge Functions
│   │   └── webhook-handler/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
├── android/                # Android native project
├── ios/                    # iOS native project
├── .github/
│   └── workflows/          # CI/CD pipelines
├── docs/                   # Documentation
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.ts      # Tailwind config
├── capacitor.config.ts     # Capacitor config
├── vercel.json             # Vercel config
└── netlify.toml            # Netlify config
```

## Architecture Patterns

### Frontend Architecture

#### Component Organization
- **Atomic Design:** Components organized by complexity
- **Composition:** Prefer composition over inheritance
- **Single Responsibility:** Each component has one job
- **Reusability:** Components are framework-agnostic where possible

#### State Management
- **Server State:** React Query for API data
- **UI State:** React useState/useReducer
- **Form State:** React Hook Form
- **Global State:** Context API for auth/theme

#### Routing
- **Client-side Routing:** React Router DOM
- **Protected Routes:** HOC for authentication checks
- **Lazy Loading:** Code splitting for performance

### Backend Architecture

#### Database
- **PostgreSQL:** Primary data store
- **Row Level Security:** User-based access control
- **Migrations:** Version-controlled schema changes
- **Indexes:** Optimized for common queries

#### Authentication
- **JWT Tokens:** Secure session management
- **OAuth:** Social login support (Google, GitHub)
- **Email/Password:** Traditional authentication
- **MFA:** Multi-factor authentication (optional)

#### Edge Functions
- **Serverless:** Deno-based functions
- **Event-driven:** Triggered by webhooks/schedules
- **Scalable:** Auto-scaling based on demand

### Mobile Architecture

#### Capacitor Bridge
- **Native APIs:** Access to device features
- **Plugins:** Camera, storage, push notifications
- **Web Code Reuse:** 95%+ code sharing with web

#### Build Process
1. Build web app (`npm run build`)
2. Sync to native projects (`npx cap sync`)
3. Build native apps (Xcode/Gradle)

## Data Flow

```
User Interface (React)
    ↓
React Query / Hooks
    ↓
Supabase Client
    ↓
Supabase API (Auto-generated REST/GraphQL)
    ↓
PostgreSQL + RLS Policies
    ↓
Data
```

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Supabase validates & issues JWT
3. JWT stored in local storage
4. JWT included in all API requests
5. Supabase validates JWT on every request

### Authorization
- **Row Level Security:** Database-level access control
- **Policy-based:** Declarative security rules
- **User Context:** RLS policies use `auth.uid()`

### Data Protection
- **Encryption at Rest:** Database encryption
- **Encryption in Transit:** HTTPS/TLS
- **API Keys:** Anon key for client, service key for admin
- **Environment Variables:** Secrets not in code

## Performance Optimization

### Frontend
- **Code Splitting:** Route-based chunks
- **Tree Shaking:** Unused code elimination
- **Image Optimization:** Lazy loading, WebP format
- **Caching:** Service workers for offline support

### Backend
- **Connection Pooling:** Efficient database connections
- **Indexes:** Fast query performance
- **CDN:** Static asset delivery via Vercel/Netlify
- **Edge Functions:** Global distribution

## Scalability

### Horizontal Scaling
- **Serverless:** Auto-scaling functions
- **CDN:** Global edge network
- **Database:** Supabase handles scaling

### Vertical Scaling
- **Supabase Tiers:** Upgrade for more resources
- **Performance Monitoring:** Identify bottlenecks
- **Query Optimization:** Efficient database queries

## Monitoring & Observability

### Logging
- **Application Logs:** Console logs in development
- **Error Tracking:** Sentry (optional)
- **Access Logs:** Supabase dashboard

### Metrics
- **Performance:** Vercel Analytics
- **User Analytics:** Custom events (optional)
- **Database Metrics:** Supabase dashboard

### Alerts
- **Uptime Monitoring:** UptimeRobot / Vercel
- **Error Alerts:** Sentry notifications
- **Performance Alerts:** Vercel Speed Insights

## Deployment Architecture

### Continuous Integration
1. Push to GitHub
2. GitHub Actions triggered
3. Install dependencies
4. Run linters
5. Build application
6. Run tests
7. Deploy if successful

### Continuous Deployment
- **Production:** `main` branch → Vercel/Netlify
- **Preview:** Pull requests → Preview URLs
- **Rollback:** One-click rollback on Vercel/Netlify

## Future Considerations

### Potential Enhancements
- **Redis:** Caching layer for frequent queries
- **Elasticsearch:** Full-text search
- **Message Queue:** Background job processing
- **GraphQL:** Alternative to REST API
- **Microservices:** Split into smaller services if needed

### Scaling Path
1. **Current:** Monolithic SPA + Supabase
2. **Phase 2:** Add caching layer
3. **Phase 3:** Microservices for heavy operations
4. **Phase 4:** Multi-region deployment

## Contributing

See the main [README.md](../README.md) for contribution guidelines.

## Support

For architecture questions, open a GitHub discussion or contact the team.
