compose-up:
	docker compose -f compose.yaml up

compose-down:
	docker compose -f compose.yaml down

compose-dev-up:
	docker compose -f docker-compose.dev.yaml up

compose-dev-down:
	docker compose -f docker-compose.dev.yaml down