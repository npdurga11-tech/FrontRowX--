#!/bin/bash
set -e

echo "========================================="
echo " FrontRowX — Starting Backend"
echo "========================================="

# Ensure Python can find the 'app' package (WORKDIR is /app, so app/ is a subdir)
export PYTHONPATH=/app

echo "[entrypoint] Waiting for PostgreSQL..."
until python -c "
import psycopg2, os, sys
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f'  DB not ready: {e}')
    sys.exit(1)
" 2>/dev/null; do
    sleep 2
done

echo "[entrypoint] PostgreSQL is ready!"
echo "[entrypoint] Running Alembic migrations..."
alembic upgrade head

echo "[entrypoint] Seeding default admin user..."
python -m app.utils.seed

if [ "$ENV" = "production" ]; then
    echo "[entrypoint] Starting Gunicorn server (Production)..."
    exec gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
else
    echo "[entrypoint] Starting Uvicorn server (Development)..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
fi
