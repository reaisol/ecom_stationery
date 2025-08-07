#!/bin/bash

echo "Starting Paper eCommerce Platform Development Environment"
echo ""

echo "Starting Flask Backend..."
cd backend && python app.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting React Frontend..."
cd .. && npm start &
FRONTEND_PID=$!

echo ""
echo "Development servers started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
