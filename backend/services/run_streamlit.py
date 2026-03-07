import subprocess
import sys
import os

def run_streamlit():
    """Run the Streamlit app"""
    try:
        # Change to the correct directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        # Run streamlit
        subprocess.run([sys.executable, "-m", "streamlit", "run", "try.py", "--server.port", "8501"])
    except Exception as e:
        print(f"Error running Streamlit: {e}")
        print("Make sure you have streamlit installed: pip install streamlit")

if __name__ == "__main__":
    run_streamlit()
