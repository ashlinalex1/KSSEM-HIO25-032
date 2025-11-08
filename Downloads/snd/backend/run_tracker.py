# run_tracker.py

import subprocess
import time
import sys

# Import the tracker's main function
from desktop_tracker_step2 import start_tracking

def main():
    """Starts the backend server and then the desktop tracker."""
    print("--- Starting the Activity Tracker Application ---")

    # Command to run the Flask backend
    # We use sys.executable to ensure we use the same Python interpreter
    backend_command = [sys.executable, "flask_backend_step2.py"]

    # Start the backend server as a background process
    print("\nStep 1: Starting the backend server in the background...")
    # The backend server runs without a visible window by default in this setup.
    backend_process = subprocess.Popen(backend_command)
    
    print(f"Backend server started with PID: {backend_process.pid}")
    print("Waiting a few seconds for the server to initialize...")
    time.sleep(5) # Give the server a moment to start up

    # Start the desktop tracker in the foreground
    print("\nStep 2: Starting the desktop tracker...")
    try:
        start_tracking()
    except KeyboardInterrupt:
        print("\n--- Shutting Down ---")
    finally:
        # Ensure the backend process is terminated when the tracker stops
        print("Stopping the backend server...")
        backend_process.terminate() # or .kill()
        backend_process.wait() # Wait for the process to terminate
        print("Application has been shut down successfully.")

if __name__ == "__main__":
    main()
