OS := $(shell uname)

# Try to load .env file if it exists
-include srcs/.env
export

ifeq ($(OS), Linux)
	VOLUMES_PATH := $(shell pwd)/data
else
	VOLUMES_PATH := $(shell pwd)/volumes
endif

# Override VOLUMES_PATH if HOST_VOLUME_PATH is set in .env
ifdef HOST_VOLUME_PATH
	VOLUMES_PATH := $(shell pwd)/$(HOST_VOLUME_PATH)
endif

all : volumes build
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d

volumes:
	@echo "Create volumes folder at $(VOLUMES_PATH)"
	@mkdir -p $(VOLUMES_PATH)/
	@chmod -R 777 $(VOLUMES_PATH)
	@echo "Volume path configured: $(VOLUMES_PATH)"

colima:
	@echo "system is : $(OS)"
ifeq ($(OS), Darwin)
	colima start --mount $(VOLUMES_PATH):w --vm-type vz
endif

nginx:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build nginx-proxy
redis:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build redis-broker
api:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build api-gateway
auth:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build auth-service
user:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build users-management
game:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build game-service

build:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml build

stop :
	docker compose -f srcs/docker-compose.yml stop

down :
	docker compose -f srcs/docker-compose.yml down

logs:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml logs -f

logs-nginx:
	docker logs -f nginx-proxy

logs-api:
	docker logs -f api-gateway

logs-auth:
	docker logs -f auth-service

re : fclean all

rebonus : fclean bonus

clean :
	@if [ -n "$$(docker ps -q)" ]; then docker stop $$(docker ps -q); else echo "No running containers to stop."; fi
	@if [ -n "$$(docker ps -aq)" ]; then docker rm -f $$(docker ps -aq); else echo "No running containers to remove."; fi
	@if [ -n "$$(docker images -q)" ]; then docker rmi -f $$(docker images -q); else echo "No images to remove."; fi
	@if [ -n "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); else echo "No volumes to remove."; fi

fclean: clean
	docker system prune -a --volumes --force
	docker network prune
	rm -fr $(VOLUMES_PATH)
# ifeq ($(OS), Darwin)
# 	colima stop && colima delete
# endif

.PHONY : all clean fclean re build volumes colima nginx redis api auth user stop down logs logs-nginx logs-api logs-auth
