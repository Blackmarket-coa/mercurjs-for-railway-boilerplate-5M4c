#!/bin/bash
# =============================================================================
# FreeBlackMarket.com - Railway PostgreSQL Targeted Cleanup
# =============================================================================
#
# Removes orphaned tables from removed plugins/modules, then runs Medusa
# migrations to create tables for new modules. Preserves all active data.
#
# USAGE:
#   # Using DATABASE_URL:
#   DATABASE_URL="postgres://postgres:pass@host:port/railway" ./scripts/cleanup-railway-postgres.sh
#
#   # Using individual PG vars:
#   PGHOST=host PGPORT=port PGUSER=postgres PGPASSWORD=pass PGDATABASE=railway \
#     ./scripts/cleanup-railway-postgres.sh
#
#   # Also run migrations after cleanup:
#   ./scripts/cleanup-railway-postgres.sh --migrate
#
#   # Skip confirmation prompt:
#   ./scripts/cleanup-railway-postgres.sh --yes --migrate
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
RUN_MIGRATE=false
SKIP_CONFIRM=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --migrate)     RUN_MIGRATE=true; shift ;;
    --yes|-y)      SKIP_CONFIRM=true; shift ;;
    --help|-h)
      echo "Usage: $0 [--migrate] [--yes]"
      echo ""
      echo "Options:"
      echo "  --migrate      Run medusa db:migrate after cleanup"
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

# Validate
if [[ -z "${PGHOST:-}" || -z "${PGDATABASE:-}" ]]; then
  log_error "No database connection configured."
  log_error "Set DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE."
  exit 1
fi

if [[ ! -f "$SQL_FILE" ]]; then
  log_error "Cleanup SQL file not found: $SQL_FILE"
  exit 1
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  TARGETED DATABASE CLEANUP             ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "  Host:     ${CYAN}${PGHOST}:${PGPORT}${NC}"
echo -e "  Database: ${CYAN}${PGDATABASE}${NC}"
echo -e "  User:     ${CYAN}${PGUSER:-postgres}${NC}"
echo -e "  Migrate:  ${CYAN}${RUN_MIGRATE}${NC}"
echo ""
echo -e "  This will drop ${RED}18 orphaned tables${NC} from removed plugins:"
echo -e "    - @mercurjs/requests (replaced by custom Request module)"
echo -e "    - Old Mercur attribute system (replaced by cms-blueprint)"
echo -e "    - Old Mercur secondary_category (unused)"
echo -e "    - Old Mercur tax_code link (unused)"
echo -e "    - Old Mercur wishlist (replaced by shopper_wishlist)"
echo -e "    - Old Mercur vendor_type table (replaced by vendor_type_enum)"
echo -e "    - Old Mercur configuration_rule (unused)"
echo ""
echo -e "  ${GREEN}All active data will be preserved.${NC}"
echo ""

if [[ "$SKIP_CONFIRM" != true ]]; then
  read -rp "Proceed? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    log_info "Aborted."
    exit 0
  fi
fi

echo ""

# Step 1: Run cleanup SQL
log_step "Dropping orphaned tables..."
if psql -f "$SQL_FILE" 2>&1; then
  log_info "Orphaned tables removed."
else
  log_error "Cleanup SQL failed. Check connection and try again."
  exit 1
fi

# Step 2: Run migrations (optional)
if [[ "$RUN_MIGRATE" == true ]]; then
  echo ""
  log_step "Running Medusa migrations to create new module tables..."
  cd "$BACKEND_DIR"

  if pnpm exec medusa db:migrate --execute-safe-links 2>&1; then
    log_info "Migrations complete."
  else
    log_error "Migrations failed. Check the output above for errors."
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CLEANUP COMPLETE                      ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Removed 18 orphaned tables. Active data preserved."
if [[ "$RUN_MIGRATE" != true ]]; then
  echo ""
  echo -e "  To create new module tables, run:"
  echo -e "    ${CYAN}cd backend && pnpm exec medusa db:migrate --execute-safe-links${NC}"
fi
echo ""
