.PHONY: dev build start lint test test-watch db-seed migrate migrate-deploy generate docker-up docker-down docker-build docker-logs docker-redeploy clean

# Development
dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

# Linting & Testing
lint:
	pnpm lint

test:
	pnpm test

test-watch:
	pnpm test:watch

# Database
db-seed:
	pnpm db:seed

migrate:
	pnpm prisma migrate dev

migrate-deploy:
	pnpm prisma migrate deploy

generate:
	pnpm prisma generate

# Docker
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f

docker-redeploy:
	docker compose down && docker compose up -d --build

# Utilities
clean:
	rm -rf .next node_modules

install:
	pnpm install
