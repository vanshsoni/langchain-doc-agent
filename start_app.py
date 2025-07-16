#!/usr/bin/env python3
"""
AI Document Chatbot - Application Launcher
Starts both backend and frontend servers concurrently
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

class AppLauncher:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def check_dependencies(self):
        """Check if required dependencies are installed"""
        print("🔍 Checking dependencies...")
        
        # Check if virtual environment exists
        if not os.path.exists("venv"):
            print("❌ Virtual environment not found. Please run:")
            print("   python -m venv venv")
            print("   source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
            print("   pip install -r requirements.txt")
            return False
        
        # Check if .env file exists
        if not os.path.exists(".env"):
            print("❌ .env file not found. Please create one with:")
            print("   OPENAI_API_KEY=your_api_key_here")
            return False
        
        # Check if frontend dependencies are installed
        frontend_path = Path("frontend")
        if not frontend_path.exists():
            print("❌ Frontend directory not found")
            return False
        
        node_modules = frontend_path / "node_modules"
        if not node_modules.exists():
            print("⚠️  Frontend dependencies not installed. Installing...")
            try:
                subprocess.run(["npm", "install"], cwd="frontend", check=True)
                print("✅ Frontend dependencies installed")
            except subprocess.CalledProcessError:
                print("❌ Failed to install frontend dependencies")
                return False
        
        print("✅ All dependencies checked")
        return True
    
    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting backend server...")
        
        # Activate virtual environment and start backend
        if sys.platform == "win32":
            # Windows
            activate_script = "venv\\Scripts\\activate"
            cmd = f"cmd /c \"{activate_script} && uvicorn main:app --reload --host 0.0.0.0 --port 8000\""
        else:
            # Unix/Linux/macOS
            activate_script = "venv/bin/activate"
            cmd = f"source {activate_script} && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
        
        try:
            self.backend_process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for server to start
            time.sleep(3)
            
            # Check if backend is running
            try:
                import requests
                response = requests.get("http://localhost:8000/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Backend server started successfully")
                    return True
                else:
                    print("❌ Backend server failed to start properly")
                    return False
            except ImportError:
                # If requests is not available, just assume it's running
                print("✅ Backend server started (health check skipped)")
                return True
                
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the React TypeScript frontend server"""
        print("🚀 Starting frontend server...")
        
        try:
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd="frontend",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait longer for Vite server to start (it takes more time than Next.js)
            print("⏳ Waiting for frontend server to start...")
            time.sleep(10)
            
            # Check if frontend is running with retries
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    import requests
                    response = requests.get("http://localhost:8080", timeout=10)
                    if response.status_code == 200:
                        print("✅ Frontend server started successfully")
                        return True
                    else:
                        print(f"⚠️  Frontend server responding but status code: {response.status_code}")
                        if attempt < max_retries - 1:
                            print(f"⏳ Retrying in 3 seconds... (attempt {attempt + 1}/{max_retries})")
                            time.sleep(3)
                        else:
                            print("❌ Frontend server failed to start properly")
                            return False
                except requests.exceptions.ConnectionError:
                    if attempt < max_retries - 1:
                        print(f"⏳ Frontend server not ready yet, retrying in 3 seconds... (attempt {attempt + 1}/{max_retries})")
                        time.sleep(3)
                    else:
                        print("❌ Frontend server failed to start - connection refused")
                        return False
                except ImportError:
                    # If requests is not available, just assume it's running
                    print("✅ Frontend server started (health check skipped)")
                    return True
                except Exception as e:
                    print(f"❌ Frontend health check error: {e}")
                    if attempt < max_retries - 1:
                        print(f"⏳ Retrying in 3 seconds... (attempt {attempt + 1}/{max_retries})")
                        time.sleep(3)
                    else:
                        return False
                
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False
    
    def print_urls(self):
        """Print the URLs for accessing the application"""
        print("\n" + "="*60)
        print("🎉 APPLICATION STARTED SUCCESSFULLY!")
        print("="*60)
        print()
        print("📱 Access your application at:")
        print("   🌐 Frontend (React TypeScript): http://localhost:8080")
        print("   🔧 Backend API: http://localhost:8000")
        print("   📊 API Documentation: http://localhost:8000/docs")
        print("   ❤️  Health Check: http://localhost:8000/health")
        print()
        print("📋 Supported file types: PDF, TXT, DOC, DOCX")
        print("📏 Maximum file size: 5MB")
        print()
        print("🛑 To stop the application, press Ctrl+C")
        print("="*60)
        print()
    
    def monitor_processes(self):
        """Monitor the running processes"""
        while self.running:
            time.sleep(1)
            
            # Check if processes are still running
            if self.backend_process and self.backend_process.poll() is not None:
                print("❌ Backend server stopped unexpectedly")
                self.running = False
                break
                
            if self.frontend_process and self.frontend_process.poll() is not None:
                print("❌ Frontend server stopped unexpectedly")
                self.running = False
                break
    
    def cleanup(self):
        """Clean up processes on exit"""
        print("\n🛑 Shutting down servers...")
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend server stopped")
            
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend server stopped")
        
        print("👋 Application stopped")
    
    def run(self):
        """Main method to start the application"""
        print("🤖 AI Document Chatbot - Application Launcher")
        print("="*50)
        
        # Check dependencies
        if not self.check_dependencies():
            print("\n❌ Dependency check failed. Please fix the issues above.")
            return
        
        # Start backend
        if not self.start_backend():
            print("\n❌ Failed to start backend server.")
            return
        
        # Start frontend
        if not self.start_frontend():
            print("\n❌ Failed to start frontend server.")
            self.cleanup()
            return
        
        # Print URLs
        self.print_urls()
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, lambda sig, frame: self.shutdown())
        signal.signal(signal.SIGTERM, lambda sig, frame: self.shutdown())
        
        # Monitor processes
        try:
            self.monitor_processes()
        except KeyboardInterrupt:
            self.shutdown()
    
    def shutdown(self):
        """Graceful shutdown"""
        print("\n🛑 Received shutdown signal...")
        self.running = False
        self.cleanup()
        sys.exit(0)

def main():
    """Main entry point"""
    launcher = AppLauncher()
    launcher.run()

if __name__ == "__main__":
    main() 