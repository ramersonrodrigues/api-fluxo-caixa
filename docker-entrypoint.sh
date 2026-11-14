#!/bin/sh
set -e

echo "Running database migrations..."
node ace migration:run --force

echo "Starting AdonisJS server..."
exec node bin/server.js
