#!/bin/bash
# ==============================================================================
# FundOS Automated Deployment Script
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

# Text formatting helper
info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}
success() {
  echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}
error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
}

info "Starting FundOS production deployment sequence..."

# 1. Pull latest changes
if [ -d .git ]; then
  info "Fetching latest code from remote git repository..."
  git pull origin main
else
  info "Not a git repository, skipping git pull."
fi

# 2. Check docker-compose command availability
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  error "Neither 'docker-compose' nor 'docker compose' was found on your system."
  error "Please install Docker Compose and try again."
  exit 1
fi

# 3. Copy production env variables template if .env does not exist
if [ ! -f .env ]; then
  info "No .env file found. Creating default from template..."
  cp .env.prod.example .env
  info "PLEASE EDIT THE CREATED .env FILE WITH YOUR PRODUCTION SECRETS AND RE-DEPLOY."
fi

# 4. Start database and cache first to apply migrations
info "Starting database and cache services..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d postgres redis

info "Waiting for database connection to stabilize..."
sleep 5

# 5. Build and deploy backend-api, trader, and admin dashboards
info "Building and launching all service containers..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

# 6. Apply database migrations
info "Executing prisma migrations and seeding..."
docker exec fundos-backend-prod pnpm --filter backend-api run prisma migrate deploy
docker exec fundos-backend-prod pnpm --filter backend-api run prisma db seed

# 7. Print deployment status
info "Deployment complete. Container status report:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

success "FundOS is now live and running in production!"
success "Trader Dashboard: http://localhost:3000"
success "Backend REST API: http://localhost:3001"
success "Admin Control Portal: http://localhost:3002"
