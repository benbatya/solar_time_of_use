import subprocess
import socket
import time
import webbrowser
import os
import signal
import sys

BACKEND_DIR = os.path.join(os.getcwd(), 'backend')
FRONTEND_DIR = os.path.join(os.getcwd(), 'frontend')
BACKEND_PORT = 3000
FRONTEND_PORT = 5173
BACKEND_URL = f"http://localhost:{BACKEND_PORT}"
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

processes = []

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def start_process(command, cwd):
    print(f"Starting: {command} in {cwd}")
    # shell=True is used here for convenience with 'npm run dev', 
    # but be aware of security implications in production with untrusted input.
    # Here it's a local dev script.
    process = subprocess.Popen(command, cwd=cwd, shell=True, start_new_session=True)
    processes.append(process)
    return process

def cleanup(sig, frame):
    print("\nStopping services...")
    for p in processes:
        # Since we used shell=True, sending signal to the wrapper shell might not be enough.
        # We try to terminate the process group.
        try:
           os.killpg(os.getpgid(p.pid), signal.SIGTERM)
        except Exception:
             p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)

def main():
    backend_running = is_port_in_use(BACKEND_PORT)
    frontend_running = is_port_in_use(FRONTEND_PORT)

    if not backend_running:
        print("Backend not running. Starting...")
        # npm run dev is usually used for development
        start_process("npm run dev", BACKEND_DIR)
    else:
        print("Backend is already running.")

    if not frontend_running:
        print("Frontend not running. Starting...")
        start_process("npm run dev", FRONTEND_DIR)
    else:
        print("Frontend is already running.")

    print(f"Waiting for services to be ready...")
    
    # Simple wait loop to verify services are up before opening browser
    # In a more robust script, we might poll the health endpoints
    if not backend_running or not frontend_running:
         time.sleep(5) 

    print(f"Opening {FRONTEND_URL}")
    webbrowser.open(FRONTEND_URL)

    print("Services are running. Press Ctrl+C to stop.")
    signal.pause()

if __name__ == "__main__":
    # Ensure subprocesses are started in a new process group for clean kill
    main()
