# Architecture Overview

LegallyAI is built on a modern, scalable architecture using GitHub + Supabase.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Pages   │  │Components│  │   Hooks  │  │  Utils  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (Backend as a Service)            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐│
│  │ PostgreSQL   │  │ Edge Functions│  │    Auth      ││
│  │   Database   │  │  (Deno API)   │  │   & Storage  ││
│  └──────────────┘  └──────────────┘  └───────────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  External Services                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ AdSense  │  │  AdMob   │  │  Banks   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn-ui
- **Styling:** Tailwind CSS
- **State Management:** React Query + Context
- **Routing:** React Router
- **Mobile:** Capacitor

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ads/            # Ad components
│   ├── business/       # Business hub components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client
└── types/              # TypeScript types
```

### Key Design Patterns

1. **Component Composition** - Build complex UIs from simple components
2. **Custom Hooks** - Encapsulate stateful logic
3. **Context Providers** - Share global state
4. **Route-based Code Splitting** - Load pages on demand

---

## Backend Architecture

### Supabase Components

1. **PostgreSQL Database**
   - User data
   - Subscriptions
   - Documents
   - Analytics
   - Payments

2. **Edge Functions (Deno)**
   - Payment processing
   - Document generation
   - AI chat
   - Analytics

3. **Authentication**
   - Email/password
   - Social login
   - JWT tokens

4. **Storage**
   - Document PDFs
   - User uploads

### Database Schema

Key tables:

```sql
-- Users (managed by Supabase Auth)
auth.users

-- Profiles
profiles (id, user_id, full_name, avatar_url, ...)

-- Subscriptions
subscriptions (id, user_id, tier, status, ...)

-- Documents
documents (id, user_id, type, content, ...)

-- Payments
payments (id, user_id, amount, status, ...)

-- Credits/Earnings
user_credits (id, user_id, balance, lifetime_earned, ...)

-- Payout Requests
payout_requests (id, user_id, amount, status, ...)
```

### Row Level Security (RLS)

All tables use RLS policies:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Data Flow

### Authentication Flow

```
User → Login → Supabase Auth → JWT Token → Store in Client
```

### Payment Flow

```
User → Click Subscribe → process-payment function
     → Update database → Return success → Update UI
```

### Document Generation Flow

```
User → Fill Form → generate-document function
     → Create PDF → Store in Storage → Return URL
```

---

## Security

### Frontend

- Environment variables for secrets
- No API keys in code
- HTTPS only
- XSS prevention
- CSRF protection

### Backend

- Row Level Security (RLS)
- JWT authentication
- SQL injection prevention
- Rate limiting
- Input validation

---

## Performance

### Optimization Strategies

1. **Code Splitting** - Load only what's needed
2. **Lazy Loading** - Defer non-critical resources
3. **Image Optimization** - Compress and resize images
4. **Caching** - Cache static assets
5. **CDN** - Serve assets from edge locations

### Monitoring

- Vercel/Netlify Analytics
- Supabase Metrics
- Error tracking
- Performance monitoring

---

## Deployment

### CI/CD Pipeline

```
Push to GitHub → GitHub Actions → Build → Test
              → Deploy to Vercel/Netlify
              → Deploy Edge Functions to Supabase
              → Run Database Migrations
```

### Environments

- **Development** - Local development
- **Staging** - Preview deployments
- **Production** - Live application

---

## Scaling

### Horizontal Scaling

- Supabase auto-scales database
- Vercel/Netlify auto-scale frontend
- Edge functions scale automatically

### Database Optimization

- Indexes on frequently queried columns
- Materialized views for analytics
- Connection pooling
- Query optimization

---

## Future Enhancements

- [ ] WebSockets for real-time features
- [ ] GraphQL API layer
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Multi-region deployment

---

**Related:** [API Documentation](./API.md)
