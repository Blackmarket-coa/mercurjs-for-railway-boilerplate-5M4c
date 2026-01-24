# Database Check Scripts

Helper scripts to check seller requests in the database.

## Security Notice

**Never commit database credentials to version control!**

These scripts are designed to accept the database URL as an environment variable or command-line argument.

## Usage

### Option 1: Environment Variable

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/check-seller-requests.sh
```

### Option 2: Command Line Argument

```bash
./scripts/check-seller-requests.sh "postgresql://user:password@host:port/database"
```

### Option 3: SQL Script Directly

```bash
psql "$DATABASE_URL" -f scripts/check-seller-requests.sql
```

## What These Scripts Do

### check-seller-requests.sh
Bash script that runs comprehensive checks on seller creation requests:
- Total request count
- Seller creation request count
- Breakdown by status (pending, accepted, rejected)
- Latest 5 seller requests with details

### check-seller-requests.sql
SQL script with detailed queries:
- Request table structure
- Total and seller-specific counts
- Status breakdown
- Latest 10 requests with full details
- All request types in the system
- Sample data structure

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
