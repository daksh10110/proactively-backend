# Proactively Backend

This guide explains how to run the Proactively backend using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

## Running the Application

1. **Clone the repository** (if you haven't already):

    ```bash
    git clone https://github.com/daksh10110/proactively-backend.git
    cd proactively-backend
    ```

2. **Start the application using Docker Compose:**

    ```bash
    docker compose up
    ```

    - The forms service will be accessible at `http://localhost:3000`.
    - The room service will be accessible at `http://localhost:4000`.
    - The frontend will be accessible at `http://localhost:5173`.


## Stopping the Application

To stop and remove the containers:

```bash
docker compose down
```

## Customization

- Edit the `docker-compose.yml` file or environment variables as needed for your setup.

## Troubleshooting

- Ensure no other service is using port 8000.
- Check container logs with:

  ```bash
  docker compose logs
  ```
