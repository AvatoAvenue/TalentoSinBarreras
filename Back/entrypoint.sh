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

echo "Ejecutando seed..."
npx prisma db seed

echo "Iniciando servidor..."
exec "$@"
