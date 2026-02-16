#!/bin/bash
# =============================================================================
# FreeBlackMarket.com - Railway PostgreSQL Cleanup & Reset
# =============================================================================
#
# Drops all tables, types, sequences, and functions from the Railway Postgres
# database, then runs Medusa migrations to recreate everything from the
# current codebase. This ensures the database schema matches the repo exactly.
#
# USAGE:
#   # Using DATABASE_URL environment variable:
#   DATABASE_URL="postgres://postgres:pass@host:port/railway" ./scripts/cleanup-railway-postgres.sh
#
#   # Using individual connection parameters:
#   PGHOST=host PGPORT=port PGUSER=postgres PGPASSWORD=pass PGDATABASE=railway ./scripts/cleanup-railway-postgres.sh
#
#   # Skip migrations (just cleanup):
#   ./scripts/cleanup-railway-postgres.sh --no-migrate
#
#   # Also run seed after migrations:
#   ./scripts/cleanup-railway-postgres.sh --seed
#
#   # Skip confirmation prompt:
#   ./scripts/cleanup-railway-postgres.sh --yes
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="${PROJECT_ROOT}/backend"
SQL_FILE="${SCRIPT_DIR}/cleanup-railway-postgres.sql"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  $1"; }

# Parse arguments
RUN_MIGRATE=true
RUN_SEED=false
SKIP_CONFIRM=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --no-migrate)  RUN_MIGRATE=false; shift ;;
    --seed)        RUN_SEED=true; shift ;;
    --yes|-y)      SKIP_CONFIRM=true; shift ;;
    --help|-h)
      echo "Usage: $0 [--no-migrate] [--seed] [--yes]"
      echo ""
      echo "Options:"
      echo "  --no-migrate   Skip running migrations after cleanup"
      echo "  --seed         Run seed script after migrations"
      echo "  --yes, -y      Skip confirmation prompt"
      echo ""
      echo "Environment:"
      echo "  DATABASE_URL   PostgreSQL connection URL (required if PG* vars not set)"
      echo "  PGHOST         Database host"
      echo "  PGPORT         Database port"
      echo "  PGUSER         Database user"
      echo "  PGPASSWORD     Database password"
      echo "  PGDATABASE     Database name"
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Resolve connection parameters
if [[ -n "${DATABASE_URL:-}" ]]; then
  # Parse DATABASE_URL into PG* variables for psql
  url="${DATABASE_URL#postgres://}"
  url="${url#postgresql://}"

  userpass="${url%%@*}"
  export PGUSER="${userpass%%:*}"
  export PGPASSWORD="${userpass#*:}"

  hostdb="${url#*@}"
  hostport="${hostdb%%/*}"
  export PGHOST="${hostport%%:*}"
  export PGPORT="${hostport#*:}"
  [[ "$PGPORT" == "$PGHOST" ]] && export PGPORT="5432"

  dbname="${hostdb#*/}"
  export PGDATABASE="${dbname%%\?*}"
fi

# Validate we have connection info
if [[ -z "${PGHOST:-}" || -z "${PGDATABASE:-}" ]]; then
  log_error "No database connection configured."
  log_error "Set DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE."
  exit 1
fi

# Validate SQL file exists
if [[ ! -f "$SQL_FILE" ]]; then
  log_error "Cleanup SQL file not found: $SQL_FILE"
  exit 1
fi

echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}  DATABASE CLEANUP - DESTRUCTIVE ACTION ${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "  Host:     ${CYAN}${PGHOST}:${PGPORT}${NC}"
echo -e "  Database: ${CYAN}${PGDATABASE}${NC}"
echo -e "  User:     ${CYAN}${PGUSER:-postgres}${NC}"
echo -e "  Migrate:  ${CYAN}${RUN_MIGRATE}${NC}"
echo -e "  Seed:     ${CYAN}${RUN_SEED}${NC}"
echo ""
echo -e "${YELLOW}This will DROP ALL tables, types, sequences, and functions.${NC}"
echo -e "${YELLOW}All data will be permanently deleted.${NC}"
echo ""

if [[ "$SKIP_CONFIRM" != true ]]; then
  read -rp "Type 'CLEANUP' to confirm: " confirm
  if [[ "$confirm" != "CLEANUP" ]]; then
    log_info "Aborted."
    exit 0
  fi
fi

echo ""

# Step 1: Run cleanup SQL
log_step "Phase 1/3: Dropping all database objects..."
if psql -f "$SQL_FILE" 2>&1; then
  log_info "Database cleanup complete."
else
  log_error "Cleanup SQL failed. Check connection and try again."
  exit 1
fi

# Step 2: Run migrations
if [[ "$RUN_MIGRATE" == true ]]; then
  log_step "Phase 2/3: Running Medusa migrations..."
  cd "$BACKEND_DIR"

  if pnpm exec medusa db:migrate --execute-safe-links 2>&1; then
    log_info "Migrations complete."
  else
    log_error "Migrations failed. Check the output above for errors."
    exit 1
  fi
else
  log_step "Phase 2/3: Skipping migrations (--no-migrate)"
fi

# Step 3: Seed (optional)
if [[ "$RUN_SEED" == true ]]; then
  log_step "Phase 3/3: Running seed script..."
  cd "$BACKEND_DIR"

  if pnpm seed 2>&1; then
    log_info "Seeding complete."
  else
    log_warn "Seeding failed. You can run it manually: cd backend && pnpm seed"
  fi
else
  log_step "Phase 3/3: Skipping seed (use --seed to enable)"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CLEANUP COMPLETE                      ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
if [[ "$RUN_MIGRATE" == true ]]; then
  echo -e "  Database schema now matches the repo."
  if [[ "$RUN_SEED" != true ]]; then
    echo -e "  To seed demo data: ${CYAN}cd backend && pnpm seed${NC}"
  fi
else
  echo -e "  Database is empty. To recreate schema:"
  echo -e "    ${CYAN}cd backend && pnpm exec medusa db:migrate --execute-safe-links${NC}"
fi
echo ""
