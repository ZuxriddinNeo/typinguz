## Build locally

From root directoy:

```
  docker buildx build --progress=plain --no-cache -t typeuz/typeuz-backend:latest . -f  ./docker/backend/Dockerfile
  docker buildx build --progress=plain --no-cache -t  typeuz/typeuz-frontend:latest . -f  ./docker/frontend/Dockerfile
```
