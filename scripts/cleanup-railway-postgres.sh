#!/bin/bash
# =============================================================================
# FreeBlackMarket.com - Railway PostgreSQL Maintenance Script
# =============================================================================
#
# This script verifies database health and runs pending migrations.
#
# NOTE: No tables are dropped. The @mercurjs/b2c-core plugin registers
# link definitions and subscribers at runtime that query ALL Mercur-owned
# tables, even those replaced by custom modules. Dropping them causes
# runtime errors. All 302+ tables must remain.
#
# USAGE:
#   DATABASE_URL="postgres://postgres:pass@host:port/railway" ./scripts/cleanup-railway-postgres.sh
#
#   # Or with PG vars:
#   PGHOST=host PGPORT=port PGUSER=postgres PGPASSWORD=pass PGDATABASE=railway \
#     ./scripts/cleanup-railway-postgres.sh
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="${PROJECT_ROOT}/backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  $1"; }

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

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  DATABASE HEALTH CHECK                 ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 1: Count tables
if [[ -n "${PGHOST:-}" ]]; then
  log_step "Checking table count..."
  TABLE_COUNT=$(psql -t -A -c "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null || echo "?")
  log_info "Current tables: ${TABLE_COUNT}"
fi

# Step 2: Run migrations if backend exists
if [[ -d "$BACKEND_DIR" ]]; then
  echo ""
  log_step "Running Medusa migrations..."
  cd "$BACKEND_DIR"

  if pnpm exec medusa db:migrate --execute-safe-links 2>&1; then
    log_info "Migrations complete."
  else
    echo -e "${YELLOW}[WARN]${NC}  Migrations returned non-zero. Check output above."
  fi
else
  echo ""
  log_info "Backend directory not found locally. Migrations run on Railway deploy."
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DONE                                  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
