#!/bin/sh

echo "Running migrations..."
node src/db/migrate.js

echo "Running seed data..."
node src/db/seed.js

echo "Starting server..."
node src/server.js
