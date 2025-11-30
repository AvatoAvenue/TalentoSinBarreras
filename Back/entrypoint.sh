#!/bin/sh
set -e

echo "Esperando a la base de datos..."

until pg_isready -h db -p 5432 -U postgres > /dev/null 2>&1; do
  echo "Postgres no está listo, reintentando..."
  sleep 1
done

echo "Base de datos lista!"

echo "Ejecutando migraciones..."
npx prisma migrate deploy

if [ ! -f /app/.seed_done ]; then
  echo "Ejecutando seed por primera vez..."
  npx prisma db seed
  touch /app/.seed_done
else
  echo "Seed ya ejecutado, saltando..."
fi

echo "Iniciando servidor..."
exec "$@"

