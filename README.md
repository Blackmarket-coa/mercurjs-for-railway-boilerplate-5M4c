# MercurJS Marketplace Platform

A comprehensive, production-ready multi-vendor marketplace platform built on MedusaJS v2 with extensive customizations for B2C commerce, local food systems, agricultural markets, and community economies.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

## Overview

MercurJS Marketplace is an enterprise-grade marketplace platform that combines modern e-commerce capabilities with innovative features for food systems, agricultural commerce, and community-driven economies. Built on MedusaJS v2 with 58+ custom modules, this platform supports everything from traditional B2C marketplaces to sophisticated food hubs, CSA operations, and community resource management.

### What Makes This Platform Unique

- **Multi-Vendor Architecture** - Complete vendor onboarding, verification, and store management
- **Financial Innovation** - Hawala double-entry ledger with Stellar blockchain settlement
- **Agricultural Support** - Harvest tracking, growing seasons, food hub operations, CSA management
- **Community Features** - Community gardens, shared kitchens, democratic governance, volunteer time banking
- **Advanced Commerce** - Digital products, event ticketing, rentals, subscriptions, restaurant operations
- **Food Distribution** - Comprehensive food system with donations, trades, mutual aid, and proof of delivery
- **Split Payments** - Automated commission handling with Stripe Connect for vendor payouts
- **Real-time Communication** - Integrated Rocket.Chat for vendor-customer-admin messaging

## Technology Stack

### Core Technologies
- **Backend**: MedusaJS v2.12.5 with Node.js 20+
- **Database**: PostgreSQL 14+ with MikroORM
- **Cache/Queue**: Redis
- **Admin Panel**: React 18 + Vite + Medusa UI 4.0
- **Vendor Panel**: React 18 + Vite + Medusa UI 4.0
- **Storefront**: Next.js 15.1.6 with React 19
- **Language**: TypeScript (4,536+ files)

### Integrations
- **Payments**: Stripe, Stripe Connect, ACH (via Hawala)
- **Blockchain**: Stellar SDK for settlement
- **Storage**: MinIO (S3-compatible) + Local fallback
- **Email**: SMTP (Brevo, Gmail, etc.) + Resend
- **Search**: Algolia + PostgreSQL fallback
- **Messaging**: Rocket.Chat + Jitsi Meet (via Rocket.Chat video conferencing)
- **Shipping**: ShipStation (optional)
- **ERP**: Odoo integration (optional)

Deployment guide for Jitsi on Railway: [`infrastructure/jitsi/README.md`](infrastructure/jitsi/README.md).

## Project Structure

```
mercurjs-for-railway-boilerplate/
├── backend/              # MedusaJS backend with 58 custom modules
│   ├── src/
│   │   ├── modules/      # Custom marketplace modules
│   │   ├── workflows/    # Business logic workflows
│   │   └── subscribers/  # Event handlers
│   └── static/           # Local file storage (dev)
│
├── admin-panel/          # Platform administrator dashboard
│   ├── src/
│   │   ├── routes/       # 46+ admin routes
│   │   └── i18n/         # 30+ language translations
│
├── vendor-panel/         # Multi-vendor seller dashboard
│   ├── src/
│   │   ├── routes/       # 43+ vendor management routes
│   │   └── hooks/        # Custom React hooks
│
└── storefront/           # Customer-facing marketplace
    ├── src/
    │   ├── app/          # Next.js app directory
    │   ├── modules/      # Frontend modules
    │   └── lib/          # Utilities and services
```

## Core Features

### Marketplace Capabilities

#### Multi-Vendor Management
- **Vendor Onboarding** - Self-service registration with customizable approval workflows
- **Verification System** - Trust badges, verification levels, and compliance tracking
- **Store Management** - Individual vendor storefronts with custom branding
- **Commission Engine** - Flexible commission structures (percentage, fixed, tiered)
- **Payout Automation** - Stripe Connect integration for automated vendor payouts
- **Vendor Analytics** - Sales, orders, and performance metrics

#### Product Types
- **Physical Products** - Traditional e-commerce with inventory management
- **Digital Products** - Automated delivery of downloads, licenses, and digital goods
- **Event Tickets** - Venue management, seating, ticket types, and check-in
- **Rentals** - Time-based pricing with availability calendars
- **Subscriptions** - Recurring orders, CSA shares, meal plans
- **Restaurant Items** - Menu management, modifiers, preparation times
- **Agricultural Products** - Harvest tracking, seasonal availability, lot management

#### Customer Features
- **Multi-language Support** - 30+ languages including RTL support
- **Wishlist** - Save products for later
- **Reviews & Ratings** - Product feedback system powered by @mercurjs/reviews
- **Request for Quote** - Custom order requests for unique needs
- **Order Tracking** - Real-time order status updates
- **Impact Metrics** - Track environmental and social impact of purchases
- **Wallet System** - Hawala ledger for deposits, credits, and transactions

### Agricultural & Food System Features

#### Farm Operations
- **Producer Profiles** - 14 producer types (farm, restaurant, ghost kitchen, cottage food, etc.)
- **Harvest Management** - Track harvests, create lots, manage availability windows
- **Growing Seasons** - Plan plantings and seasonal products
- **Harvest Batches** - Scarcity tracking and seasonal availability
- **Product Archetypes** - Behavior-driven product classification

#### Food Hub & Cooperative Management
- **Order Cycles** - OFN-style coordinated buying cycles
- **CSA Management** - Community Supported Agriculture shares and subscriptions
- **Food Hub Operations** - Aggregate products from multiple producers
- **Cooperative Tools** - Democratic governance and member management
- **Enterprise Fees** - Coordinator fees and cost transparency

#### Food Distribution
- **8 Transaction Types** - Sales, donations, trades, gifts, mutual aid, volunteer exchange, barter, time bank
- **Real-time GPS Tracking** - Live courier location tracking
- **Proof of Delivery** - Photo verification and signatures
- **Batch Deliveries** - Multi-stop route optimization
- **Local Delivery** - Custom fulfillment provider for local operations
- **Delivery Zones** - Geographic service area management

### Community Infrastructure

#### Shared Resources
- **Community Gardens** - Plot management, soil zones, plot assignments
- **Commercial Kitchens** - Shared facility booking, equipment tracking, time slots
- **Volunteer System** - Time banking, work parties, volunteer logging
- **Democratic Governance** - Proposals, voting, member participation

#### Financial Innovation
- **Hawala Ledger** - Double-entry bookkeeping system
- **Blockchain Settlement** - Daily settlement to Stellar blockchain
- **ACH Integration** - Bank deposits and withdrawals
- **Investment Pools** - Community investment in producers
- **Cost Transparency** - Buyer sees full cost breakdown
- **Impact Tracking** - Buyer and producer impact metrics

### Technical Features

#### Backend (58 Custom Modules)

**Phase 1: Domain Architecture**
- seller-extension
- product-archetype

**Phase 2-4: Agricultural & Food Systems**
- producer
- agriculture
- cooperative
- order-cycle
- harvest
- season
- harvest-batches

**Commerce Modules**
- ticket-booking
- restaurant
- delivery
- digital-product
- rental
- subscription
- wishlist
- request

**Financial Modules**
- hawala-ledger
- payout-breakdown
- impact-metrics

**Community Modules**
- garden
- kitchen
- governance
- volunteer
- food-distribution

**Marketplace Governance**
- vendor-verification
- vendor-rules

**Content Management**
- cms-blueprint

**Integrations**
- odoo
- shipstation
- minio-file
- resend
- smtp
- local-delivery-fulfillment
- digital-product-fulfillment

#### API Routes

**Admin API (`/admin/*`)**
- CMS management (attributes, categories, tags, types)
- Digital products
- Hawala ledger management
- Debug tools
- Producer management
- Product archetypes
- Seller management
- Ticket products & venues
- Request management
- Rocket.Chat integration

**Store API (`/store/*`)**
- Complete customer-facing API
- Carts, orders, payments
- Product catalog with search
- Food deliveries, donations, trades
- Gardens, kitchens, producers
- Hawala wallet operations
- Governance proposals
- Subscriptions, rentals, tickets

**Vendor API (`/vendor/*`)**
- Vendor dashboard operations
- Product and inventory management
- Order and delivery management
- Farm operations
- Hawala earnings and pools
- Rocket.Chat integration

#### Workflows (18+ Categories)
- Cart completion with tickets
- Digital product creation & fulfillment
- Delivery workflows
- Food distribution workflows
- Governance (proposals, voting)
- Harvest management
- Rental workflows
- Restaurant operations
- Subscription renewals
- Vendor notifications

#### Scheduled Jobs
- **activate-rentals** - Activate rental periods
- **hawala-settlement** - Daily blockchain settlement (midnight UTC)
- **order-cycle-status-update** - Update order cycle statuses
- **process-subscription-renewals** - Handle recurring subscriptions

#### Event Subscribers (13 Total)
- Digital order handling
- Product deletion cleanup
- Hawala order payments & refunds
- Rental cancellations
- Order placement notifications
- Password reset emails
- Seller creation notifications
- Rocket.Chat user creation
- Vendor verification notifications

## Quick Start

### Prerequisites

- **Node.js 20+** (Recommended: v22.13.1)
- **PostgreSQL 14+**
- **Redis** (local or Railway)
- **pnpm** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/mercurjs-for-railway-boilerplate.git
cd mercurjs-for-railway-boilerplate
```

2. **Install dependencies**
```bash
# Backend
cd backend
pnpm install

# Admin Panel
cd ../admin-panel
pnpm install

# Vendor Panel
cd ../vendor-panel
pnpm install

# Storefront
cd ../storefront
pnpm install
```

3. **Setup PostgreSQL**
```bash
# Create database
psql -U postgres
CREATE DATABASE mercurjs;
\q
```

4. **Setup Redis**
```bash
# Verify Redis is running
redis-cli ping
# Should return: PONG
```

5. **Configure environment variables**

Create `.env` files for each service:

**Backend (`backend/.env`)**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mercurjs
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
MEDUSA_ADMIN_ONBOARDING_TYPE=default
```

**Storefront (`storefront/.env.local`)**
```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Admin Panel (`admin-panel/.env`)**
```env
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_STOREFRONT_URL=http://localhost:3000
```

**Vendor Panel (`vendor-panel/.env`)**
```env
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_STOREFRONT_URL=http://localhost:3000
```

6. **Run database migrations**
```bash
cd backend
npx medusa db:migrate
```

7. **Seed the database (optional)**
```bash
pnpm seed
```

8. **Create admin user**
```bash
npx medusa user -e admin@test.com -p supersecret
```

### Running the Platform

Run all four services in separate terminals:

**Terminal 1: Backend**
```bash
cd backend
pnpm dev
# Runs on http://localhost:9000
```

**Terminal 2: Admin Panel**
```bash
cd admin-panel
pnpm dev
# Runs on http://localhost:5173
```

**Terminal 3: Vendor Panel**
```bash
cd vendor-panel
pnpm dev
# Runs on http://localhost:7001
```

**Terminal 4: Storefront**
```bash
cd storefront
pnpm dev
# Runs on http://localhost:3000
```

### Service URLs

| Service      | URL                        | Login Credentials              |
|--------------|----------------------------|--------------------------------|
| Backend API  | http://localhost:9000      | N/A                            |
| Admin Panel  | http://localhost:5173      | admin@test.com / supersecret   |
| Vendor Panel | http://localhost:7001      | vendor@test.com / supersecret  |
| Storefront   | http://localhost:3000      | N/A                            |

## Configuration

### File Storage

**Production (Railway)**: MinIO object storage is automatically configured when deploying via the Railway button. All uploads are stored in S3-compatible storage.

**Development**: Automatically falls back to local disk storage (`backend/static` folder).

**Manual MinIO Setup** (`backend/.env`):
```env
MINIO_ENDPOINT=your-minio-endpoint.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=medusa-media  # Optional, defaults to 'medusa-media'
```

### Email Configuration

The platform supports two email providers with automatic fallback:

**SMTP (Priority)** - Free/custom SMTP servers:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-key
SMTP_FROM=noreply@yourdomain.com
```

**Resend (Fallback)**:
```env
RESEND_API_KEY=re_your_api_key
RESEND_FROM=noreply@yourdomain.com
```

### Payment Configuration

**Stripe**:
```env
STRIPE_API_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

**Stripe Connect** (for vendor payouts):
```env
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id
```

### Hawala & Blockchain

**Stellar Settlement**:
```env
STELLAR_NETWORK=testnet  # or 'public' for mainnet
STELLAR_ISSUER_SECRET=your_stellar_secret_key
```

### Search Configuration

**Algolia** (optional):
```env
ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_API_KEY=your_admin_key
ALGOLIA_INDEX_NAME=products
```

### Messaging

**Rocket.Chat**:
```env
ROCKETCHAT_URL=https://your-rocketchat-instance.com
ROCKETCHAT_ADMIN_USERNAME=admin
ROCKETCHAT_ADMIN_PASSWORD=admin-password
```

## Deployment

### Railway

The easiest way to deploy is using the Railway button:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

This automatically provisions:
- PostgreSQL database
- Redis instance
- MinIO object storage
- All four services (backend, admin, vendor panel, storefront)
- Environment variables

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

**Build for production**:
```bash
# Backend
cd backend
pnpm build
pnpm start

# Admin Panel
cd admin-panel
pnpm build
pnpm preview

# Vendor Panel
cd vendor-panel
pnpm build
pnpm preview

# Storefront
cd storefront
pnpm build
pnpm start
```

## Database Schema

After migrations, the platform includes 100+ tables:

**MedusaJS Core**:
- Products, Variants, Inventory
- Orders, Payments, Fulfillments
- Customers, Users, Authentication
- Regions, Shipping, Tax
- Promotions, Discounts
- Workflows, Events

**Marketplace Extensions**:
- Sellers, Commissions
- Vendor Verification
- Product Reviews

**Agricultural & Food**:
- Producers, Harvests, Lots
- Seasons, Plantings
- Order Cycles
- Cooperatives

**Community**:
- Gardens, Plots, Soil Zones
- Kitchens, Bookings
- Proposals, Votes
- Volunteer Logs, Work Parties

**Financial**:
- Hawala Ledger Entries
- Settlement Batches
- Investment Pools
- Bank Accounts

**Content**:
- Attributes, Categories, Tags, Types
- Digital Products
- Tickets, Venues
- Rentals, Subscriptions

## API Documentation

### Admin API

Full API documentation available at `/docs` when running the backend.

Key endpoints:
- `POST /admin/auth` - Admin authentication
- `GET/POST /admin/products` - Product management
- `GET/POST /admin/orders` - Order management
- `GET/POST /admin/sellers` - Vendor management
- `GET/POST /admin/producers` - Farm/producer management

### Store API

Customer-facing API:
- `POST /store/auth` - Customer authentication
- `GET /store/products` - Browse products
- `POST /store/carts` - Cart operations
- `POST /store/orders` - Place orders
- `GET /store/producers` - Browse farms/producers
- `POST /store/hawala/deposit` - Wallet operations

### Vendor API

Vendor dashboard API:
- `POST /vendor/auth` - Vendor authentication
- `GET/POST /vendor/products` - Manage products
- `GET /vendor/orders` - View orders
- `GET /vendor/earnings` - View Hawala earnings
- `POST /vendor/deliveries` - Manage deliveries

## Development

### Code Structure

The codebase follows a modular architecture:

**Backend Modules** (`backend/src/modules/[module-name]`):
```
module-name/
├── models/           # Database entities
├── migrations/       # Database migrations
├── services/         # Business logic
├── workflows/        # Step-by-step processes
├── subscribers/      # Event listeners
├── api/              # HTTP routes
└── loaders/          # Module initialization
```

**Frontend Routes** (`admin-panel/src/routes/`, `vendor-panel/src/routes/`):
```
routes/
├── [feature]/
│   ├── page.tsx     # Main page component
│   ├── loader.ts    # Data loading
│   └── components/  # Feature components
```

### Adding a New Module

1. Create module directory: `backend/src/modules/your-module`
2. Define models: `models/your-entity.ts`
3. Create services: `services/your-service.ts`
4. Add API routes: `api/routes.ts`
5. Register in `medusa-config.ts`

### Testing

```bash
# Backend unit tests
cd backend
pnpm test

# Integration tests
pnpm test:integration

# Frontend tests
cd admin-panel
pnpm test
```

## Troubleshooting

### PostgreSQL Connection Issues

```bash
# Verify PostgreSQL is running
pg_isready -U postgres

# Check database exists
psql -U postgres -l | grep mercurjs

# Verify connection string in backend/.env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mercurjs
```

### Redis Connection Issues

```bash
# Verify Redis is running
redis-cli ping

# Check Redis URL in backend/.env
REDIS_URL=redis://localhost:6379
```

### Port Already in Use

**Find and kill process (Linux/Mac)**:
```bash
lsof -ti:9000 | xargs kill -9
```

**Windows**:
```bash
netstat -ano | findstr :9000
taskkill /PID <PID> /F
```

### Node Version Issues

```bash
# Check Node version
node --version

# Should be 20+, if using nvm:
nvm use 22
```

### Migration Issues

```bash
# Reset database (DANGER: destroys all data)
cd backend
pnpm medusa db:drop
pnpm medusa db:migrate
pnpm seed
```

## Performance Optimization

### Database Indexing

The platform includes optimized indexes for:
- Product search and filtering
- Order queries
- Vendor product lookups
- Hawala transaction ledger

### Caching

Redis caching is used for:
- Session management
- Rate limiting
- Job queues
- Temporary data

### Search

- **Algolia**: Fast, typo-tolerant product search
- **PostgreSQL Fallback**: ILIKE queries for local development

## Security

### Production Checklist

- [ ] Change all `JWT_SECRET` and `COOKIE_SECRET` values
- [ ] Use strong PostgreSQL passwords
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Redis TLS for production
- [ ] Use environment-specific configurations
- [ ] Rotate API keys regularly
- [ ] Enable Stripe webhook signature verification
- [ ] Implement CSP headers
- [ ] Enable audit logging

### Authentication

- JWT-based authentication
- Secure cookie sessions
- Password reset via email
- Role-based access control (RBAC)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Roadmap

- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Additional payment providers
- [ ] Headless CMS integration
- [ ] Advanced SEO tools
- [ ] Marketplace themes
- [ ] Plugin marketplace

## Support & Documentation

- **MercurJS Documentation**: [https://docs.mercurjs.com](https://docs.mercurjs.com)
- **MedusaJS Documentation**: [https://docs.medusajs.com](https://docs.medusajs.com)
- **MercurJS GitHub**: [https://github.com/mercurjs](https://github.com/mercurjs)
- **Community Discord**: [Join our Discord](https://discord.gg/mercurjs)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Based on:
- [MercurJS](https://mercurjs.com) - Marketplace framework
- [MedusaJS](https://medusajs.com) - E-commerce engine

## Acknowledgments

- MercurJS team for the marketplace framework
- MedusaJS team for the e-commerce foundation
- Open Food Network for inspiration on food hub features
- Stellar Foundation for blockchain infrastructure
- All contributors and community members

## Credits

**MercurJS Plugins**:
- @mercurjs/b2c-core v1.4.5
- @mercurjs/commission v1.4.5
- @mercurjs/reviews v1.4.5
- @mercurjs/framework v1.4.5
- @mercurjs/payment-stripe-connect v1.4.5

**Key Dependencies**:
- MedusaJS v2.12.5
- Next.js 15.1.6
- React 19
- PostgreSQL 14+
- Redis
- Stripe
- Stellar SDK

---

**Ready to build your marketplace?** 🚀

Get started by deploying to Railway or setting up locally following the Quick Start guide above.

For questions or support, join our [Discord community](https://discord.gg/mercurjs) or check the [documentation](https://docs.mercurjs.com).
