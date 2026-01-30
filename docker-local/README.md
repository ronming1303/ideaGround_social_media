# ideaGround - Local Docker Setup

Run ideaGround completely offline on your local machine using Docker.

## Prerequisites

- **Docker Desktop** installed and running
  - Windows/Mac: https://www.docker.com/products/docker-desktop/
  - Linux: https://docs.docker.com/engine/install/

## Quick Start

### Windows

1. Open Command Prompt or PowerShell
2. Navigate to the project folder:
   ```cmd
   cd path\to\ideaground
   ```
3. Run:
   ```cmd
   docker-compose -f docker-local/docker-compose.local.yml up --build
   ```

### Mac/Linux

1. Open Terminal
2. Navigate to the project folder:
   ```bash
   cd path/to/ideaground
   ```
3. Run:
   ```bash
   docker-compose -f docker-local/docker-compose.local.yml up --build
   ```

## Access the App

Once all containers are running (you'll see health checks passing):

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8001/api
- **MongoDB**: localhost:27017

## Login Credentials

| User Type | Email | Password |
|-----------|-------|----------|
| Admin | admin@ideaground.local | admin123 |
| Demo User | demo@ideaground.local | demo123 |

## Services

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Frontend (nginx) | 80 | 8080 |
| Backend (FastAPI) | 8001 | 8001 |
| MongoDB | 27017 | 27017 |

## Commands

### Start (with rebuild)
```bash
docker-compose -f docker-local/docker-compose.local.yml up --build
```

### Start (background mode)
```bash
docker-compose -f docker-local/docker-compose.local.yml up -d
```

### Stop
```bash
docker-compose -f docker-local/docker-compose.local.yml down
```

### View logs
```bash
docker-compose -f docker-local/docker-compose.local.yml logs -f
```

### Reset everything (delete data)
```bash
docker-compose -f docker-local/docker-compose.local.yml down -v
```

## Data Persistence

Your data is stored in a Docker volume named `ideaground_mongodb_data`. 
- Data persists across restarts
- Use `down -v` to completely reset

## Troubleshooting

### "Cannot connect to Docker daemon"
- Make sure Docker Desktop is running

### Build fails with pip error
- This setup already includes the fix for emergentintegrations
- If still failing, try: `docker system prune -a` then rebuild

### Frontend not loading
- Wait for health checks to pass (can take 30-60 seconds)
- Check logs: `docker-compose -f docker-local/docker-compose.local.yml logs frontend`

### API errors
- Check backend logs: `docker-compose -f docker-local/docker-compose.local.yml logs backend`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Browser                            │
│                   http://localhost:8080                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Frontend Container                        │
│                    (nginx + React)                           │
│                      Port: 8080                              │
│   - Serves React app                                         │
│   - Proxies /api/* to backend                               │
└─────────────────────────────┬───────────────────────────────┘
                              │ /api/*
┌─────────────────────────────▼───────────────────────────────┐
│                    Backend Container                         │
│                    (FastAPI + Python)                        │
│                      Port: 8001                              │
│   - REST API                                                 │
│   - Local authentication                                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    MongoDB Container                         │
│                      Port: 27017                             │
│   - User data                                                │
│   - Videos, shares, transactions                             │
└─────────────────────────────────────────────────────────────┘
```
