#!/usr/bin/env python3

import subprocess
import os
import sys

def kill_port(port):
    print(f"Attempting to kill process on port {port}...")
    try:
        # Run fuser -k to kill processes on the specified TCP port
        result = subprocess.run(["fuser", "-k", f"{port}/tcp"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"Successfully killed process on port {port}.")
        else:
            # fuser returns non-zero if no process is found, which is fine
            print(f"No process found on port {port} or failed to kill.")
    except FileNotFoundError:
        print("Error: 'fuser' command not found. Please ensure psmisc is installed.")
    except Exception as e:
        print(f"An error occurred while cleaning up port {port}: {e}")

def kill_script():
    print("Killing start_app.py if running...")
    try:
        subprocess.run(["pkill", "-f", "python3 start_app.py"], check=False)
    except Exception as e:
        print(f"Error killing start_app.py: {e}")

if __name__ == "__main__":
    kill_port(3000)
    kill_port(5173)
    kill_script()
    print("Cleanup complete.")
