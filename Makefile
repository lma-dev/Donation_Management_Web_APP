.PHONY: dev build start lint test test-watch seed migrate migrate-deploy generate up down logs clean install

# Development
dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	pnpm lint

test:
	pnpm test

test-watch:
	pnpm test:watch

# Database
seed:
	pnpm db:seed

migrate:
	pnpm prisma migrate dev

migrate-deploy:
	pnpm prisma migrate deploy

generate:
	pnpm prisma generate

# Docker
up:
	docker compose up -d --build

down:
	docker compose down

redeploy:
	docker compose down && docker compose up -d --build

logs:
	docker compose logs -f

# Utilities
install:
	pnpm install

clean:
	rm -rf .next node_modules
