# MyTV Backend v2

IPTV SaaS platform backend — Node.js + Express + Prisma (PostgreSQL).

## Architecture

```
src/
├── app.js                  # Express app setup
├── config/
│   └── database.js         # Prisma client + connect
├── middleware/
│   ├── auth.js             # JWT authenticate / authorize
│   ├── errorHandler.js     # Global error handler + asyncHandler
│   └── rateLimiter.js      # Global, auth & stream rate limiters
├── routes/
│   ├── auth.routes.js
│   ├── users.routes.js
│   ├── channels.routes.js
│   ├── streams.routes.js
│   ├── subscriptions.routes.js
│   ├── epg.routes.js
│   ├── packages.routes.js
│   └── admin.routes.js
├── controllers/            # Request handlers (one per domain)
└── utils/
    ├── logger.js           # Winston logger
    ├── response.js         # Unified JSON response helpers
    └── validators.js       # express-validator wrapper
prisma/
├── schema.prisma           # DB schema (User, Channel, Stream, EPG, Subscription, Package)
└── seed.js                 # Seeds admin + default packages
server.js                   # Entry point
```

## Quick Start

```bash
cp .env.example .env        # fill in DATABASE_URL + JWT secrets
npm install
npx prisma migrate dev      # run migrations
npm run db:seed             # seed admin + packages
npm run dev                 # start with nodemon
```

## API Endpoints

| Group         | Base path              |
|---------------|------------------------|
| Auth          | `POST /api/v1/auth/...`  |
| Users         | `GET/PUT /api/v1/users/` |
| Channels      | `/api/v1/channels/`    |
| Streams       | `/api/v1/streams/`     |
| Subscriptions | `/api/v1/subscriptions/` |
| EPG           | `/api/v1/epg/`         |
| Packages      | `/api/v1/packages/`    |
| Admin         | `/api/v1/admin/`       |

## Roles

- `USER` — subscriber, watchlist, stream access
- `ADMIN` — manage channels, streams, EPG, subscriptions
- `SUPER_ADMIN` — everything including user deletion & package management
