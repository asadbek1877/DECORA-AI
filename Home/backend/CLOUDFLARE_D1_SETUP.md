# Cloudflare D1 Migration Guide

## Setup Instructions

### 1. Create Cloudflare D1 Database
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create ai-interior

# This will output:
# [[d1_databases]]
# binding = "db"
# database_name = "ai-interior"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.toml
Replace `your-database-id` and `your-zone-id` with values from step 1

### 3. Run Migrations
```bash
# Create tables in D1
wrangler d1 execute ai-interior --file=prisma/migrations/20260302064911_init/migration.sql

# Or use Prisma migration (requires @prisma/internals)
wrangler d1 execute ai-interior -- "SELECT 1"
```

### 4. Local Development
- Keep using `DATABASE_URL="file:./dev.db"` in .env
- LibSQL adapter used automatically in development
- Backend runs on localhost:4000

### 5. Production Deployment
```bash
# Deploy to Cloudflare Workers
wrangler deploy --env production

# Will use D1 binding automatically
```

## Key Points
- **Development**: Local SQLite + LibSQL adapter
- **Production**: Cloudflare D1 (remote SQLite)
- **Auto-switching**: Code detects environment and picks right adapter
- **No code changes needed after setup**

## Troubleshooting

### D1 binding not found
```bash
wrangler d1 list    # List all databases
wrangler d1 info ai-interior  # Check database info
```

### Connection errors
```bash
# Test connection
wrangler d1 execute ai-interior -- "SELECT 1"
```

### Reset D1 (delete and recreate)
```bash
wrangler d1 delete ai-interior
wrangler d1 create ai-interior
```
