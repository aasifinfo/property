"""Supabase local stack setup and management for tests."""

import pytest
import os
import subprocess
import time
import httpx

base_host = "127.0.0.1"
supabase_api_port = 8000
supabase_db_port = 5432
supabase_studio_port = 3001
supabase_api_url = f"http://{base_host}:{supabase_api_port}"


@pytest.fixture(scope="session")
def supabase_test_config():
    """Fixture to provide Supabase test configuration."""
    return {
        "api_url": supabase_api_url,
        "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
        "service_role_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
        "db_url": f"postgresql://postgres:postgres@{base_host}:{supabase_db_port}/postgres",
        "studio_url": f"http://{base_host}:{supabase_studio_port}"
    }


def start_supabase_stack(show_logs: bool = False):
    """Start Supabase local stack for testing."""
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../")
    )
    
    # Check if docker-compose.yml exists
    compose_path = os.path.join(project_root, "../docker-compose.yml")
    if not os.path.exists(compose_path):
        raise RuntimeError(f"Docker Compose file not found at {compose_path}")

    # Kill any existing processes on Supabase ports
    _kill_process_on_port(supabase_api_port)
    _kill_process_on_port(supabase_db_port)
    _kill_process_on_port(supabase_studio_port)

    print("Starting Supabase local stack...")
    cmd = ["docker-compose", "up", "-d"]
    
    supabase_proc = subprocess.Popen(
        cmd,
        cwd=os.path.dirname(compose_path),
        stdout=subprocess.PIPE if not show_logs else None,
        stderr=subprocess.STDOUT if not show_logs else None,
    )

    # Wait for the command to complete
    supabase_proc.wait()
    
    if supabase_proc.returncode != 0:
        raise RuntimeError("Failed to start Supabase local stack")

    print("Waiting for Supabase API to become ready...")
    try:
        timeout = 60
        for i in range(timeout // 2):
            try:
                # Check if Supabase API is ready
                async with httpx.AsyncClient() as client:
                    response = await client.get(f"{supabase_api_url}/health", timeout=5.0)
                    if response.status_code == 200:
                        print("Supabase API is ready.")
                        break
            except Exception as e:
                print(f"Attempt {i+1}: Supabase not ready yet ({e})")
                time.sleep(2)
        else:
            raise RuntimeError("Supabase local stack did not start in time.")
    except Exception as e:
        stop_supabase_stack()
        raise e

    time.sleep(3)  # Additional wait for stability
    print("Supabase local stack should be ready now.")
    return True


def stop_supabase_stack():
    """Stop Supabase local stack."""
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../")
    )
    compose_path = os.path.join(project_root, "../docker-compose.yml")
    
    try:
        print("Stopping Supabase local stack...")
        subprocess.run(
            ["docker-compose", "down"],
            cwd=os.path.dirname(compose_path),
            check=False,
            timeout=30
        )
    except Exception as e:
        print(f"Error stopping Supabase stack: {e}")
        
    # Also kill processes on ports as fallback
    _kill_process_on_port(supabase_api_port)
    _kill_process_on_port(supabase_db_port)
    _kill_process_on_port(supabase_studio_port)


def _kill_process_on_port(port: int):
    """Kill any process using the specified port."""
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"], capture_output=True, text=True, check=False
        )

        if result.returncode == 0 and result.stdout.strip():
            pids = result.stdout.strip().split("\n")
            for pid in pids:
                if pid:
                    print(f"Killing process {pid} using port {port}...")
                    subprocess.run(["kill", "-9", pid], check=False)
                    time.sleep(1)

    except Exception as e:
        print(f"Warning: Could not check/kill processes on port {port}: {e}")


@pytest.fixture(scope="session")
def setup_supabase():
    """Start Supabase local stack for the test session when explicitly requested."""
    try:
        start_supabase_stack(show_logs=False)
        yield
    finally:
        stop_supabase_stack()


@pytest.fixture(scope="session")
def supabase_session():
    """Optional Supabase session fixture - use when you need Supabase running."""
    import os
    if os.getenv("SKIP_SUPABASE", "false").lower() == "true":
        print("Skipping Supabase setup due to SKIP_SUPABASE=true")
        yield
        return
        
    try:
        print("Starting Supabase local stack for test session...")
        start_supabase_stack(show_logs=False)
        yield
    finally:
        print("Stopping Supabase local stack...")
        stop_supabase_stack()


# Legacy compatibility fixtures
@pytest.fixture(scope="session")
def firebase_emulator():
    """Legacy compatibility - redirects to Supabase config."""
    return {
        "base_url": supabase_api_url,
        "api_url": supabase_api_url,
        "db_url": f"postgresql://postgres:postgres@{base_host}:{supabase_db_port}/postgres"
    }


@pytest.fixture(scope="session")
def emulator_session():
    """Legacy compatibility - redirects to Supabase session."""
    async def _setup_supabase_session():
        async for session in supabase_session():
            yield session
    
    return _setup_supabase_session()
