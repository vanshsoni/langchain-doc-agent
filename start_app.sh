#!/bin/bash

# AI Document Chatbot - Application Launcher (Shell Script)
# Starts both backend and frontend servers concurrently

echo "🤖 AI Document Chatbot - Application Launcher"
echo "=================================================="

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    echo "👋 Application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run:"
    echo "   python -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one with:"
    echo "   OPENAI_API_KEY=your_api_key_here"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed. Installing..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
    echo "✅ Frontend dependencies installed"
fi

echo "✅ All dependencies checked"

# Start backend server
echo "🚀 Starting backend server..."
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Backend server failed to start properly"
    cleanup
    exit 1
fi

# Start frontend server
echo "🚀 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server started successfully"
else
    echo "❌ Frontend server failed to start properly"
    cleanup
    exit 1
fi

# Print URLs
echo ""
echo "============================================================"
echo "🎉 APPLICATION STARTED SUCCESSFULLY!"
echo "============================================================"
echo ""
echo "📱 Access your application at:"
echo "   🌐 Frontend (Next.js): http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📊 API Documentation: http://localhost:8000/docs"
echo "   ❤️  Health Check: http://localhost:8000/health"
echo ""
echo "📋 Supported file types: PDF, TXT, DOC, DOCX"
echo "📏 Maximum file size: 5MB"
echo ""
echo "🛑 To stop the application, press Ctrl+C"
echo "============================================================"
echo ""

# Monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server stopped unexpectedly"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend server stopped unexpectedly"
        break
    fi
    sleep 1
done

cleanup 