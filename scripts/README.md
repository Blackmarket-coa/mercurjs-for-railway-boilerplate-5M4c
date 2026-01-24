# Database Check Scripts

Helper scripts to check requests in the database.

## Security Notice

**Never commit database credentials to version control!**

These scripts are designed to accept the database URL as an environment variable or command-line argument.

## Available Scripts

### 1. Check All Requests (Recommended)

**check-all-requests.sh** - Comprehensive overview of all request types:
- Total request count
- Breakdown by type (seller, product, etc.)
- Status distribution for each type
- Recent requests across all types
- Sample data structures

**check-all-requests.sql** - Detailed SQL queries for all request types

### 2. Check Seller Requests Only

**check-seller-requests.sh** - Focused on seller creation requests:
- Seller-specific counts
- Breakdown by status (pending, accepted, rejected)
- Latest 5 seller requests with details

**check-seller-requests.sql** - SQL queries for seller requests only

## Usage

### Option 1: Environment Variable

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"

# Check all request types
./scripts/check-all-requests.sh

# Or check seller requests only
./scripts/check-seller-requests.sh
```

### Option 2: Command Line Argument

```bash
# Check all request types
./scripts/check-all-requests.sh "postgresql://user:password@host:port/database"

# Or check seller requests only
./scripts/check-seller-requests.sh "postgresql://user:password@host:port/database"
```

### Option 3: SQL Script Directly

```bash
# All request types
psql "$DATABASE_URL" -f scripts/check-all-requests.sql

# Seller requests only
psql "$DATABASE_URL" -f scripts/check-seller-requests.sql
```

## Getting Your Database URL

For Railway projects:
1. Go to your Railway project dashboard
2. Select your database service
3. Copy the PostgreSQL connection string from the "Connect" tab
4. Use it with the scripts as shown above

## Example Output

```
=== Seller Creation Requests Count ===
 seller_requests
-----------------
              12

=== Seller Requests by Status ===
  status  | count
----------+-------
 pending  |     8
 accepted |     3
 rejected |     1
```
