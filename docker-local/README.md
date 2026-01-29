# ideaGround Local - Docker Setup
> Standalone version for offline use

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed

### Run the App

**Windows:**
```bash
double-click start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Or manually:**
```bash
docker-compose -f docker-compose.local.yml up --build
```

### Access
Open browser: **http://localhost:3000**

### Default Login
| Email | Password | Role |
|-------|----------|------|
| admin@ideaground.local | admin123 | Admin |
| demo@ideaground.local | demo123 | User |

### Stop the App
```bash
docker-compose -f docker-compose.local.yml down
```

---

## Data Persistence

Your data is stored in Docker volumes:
- `ideaground_mongodb_data` - Database

### Backup Data
```bash
./scripts/backup.sh
```

### Restore Data
```bash
./scripts/restore.sh backup_file.gz
```

### Reset to Fresh State
```bash
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up --build
```

---

## Troubleshooting

### Port Already in Use
Edit `docker-compose.local.yml` and change ports:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Slow First Start
First run downloads ~1GB of images. Subsequent starts are fast.

### Docker Not Running
Make sure Docker Desktop is running (check system tray).

---

## Development

### View Logs
```bash
docker-compose -f docker-compose.local.yml logs -f
```

### Rebuild After Changes
```bash
docker-compose -f docker-compose.local.yml up --build
```

### Access MongoDB Shell
```bash
docker exec -it ideaground-mongodb mongosh ideaground
```

---

## Differences from Cloud Version

| Feature | Cloud (Emergent) | Local (Docker) |
|---------|------------------|----------------|
| Auth | Google OAuth | Email/Password |
| Database | Shared MongoDB | Local MongoDB |
| Data | Synced | Per-machine |
| Internet | Required | Not required |

---
*ideaGround Local v1.0*
