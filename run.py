import subprocess
import os
import sys
import time
import webbrowser

def start_backend():
    print("Starting backend...")
    python_path = os.path.join(os.getcwd(), "backend", "venv", "Scripts", "python.exe")
    if not os.path.exists(python_path):
        python_path = sys.executable # Fallback
    return subprocess.Popen(
        [python_path, "-m", "uvicorn", "main:app", "--reload"],
        cwd=os.path.join(os.getcwd(), "backend")
    )

def start_frontend():
    print("Starting frontend...")
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.join(os.getcwd(), "frontend"),
        shell=True
    )

if __name__ == "__main__":
    # Check if node_modules exist, if not suggest npm install
    if not os.path.exists(os.path.join("frontend", "node_modules")):
        print("Error: node_modules not found in frontend. Please run 'npm install' in the frontend directory.")
        sys.exit(1)

    backend_proc = start_backend()
    frontend_proc = start_frontend()

    print("\nPersonal Cloud is starting...")
    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:3000")
    
    time.sleep(3)
    webbrowser.open("http://localhost:3000")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping...")
        backend_proc.terminate()
        frontend_proc.terminate()
