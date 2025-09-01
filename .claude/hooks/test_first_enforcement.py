#!/usr/bin/env python3
"""
Test-First Enforcement Hook (PreToolUse)
Blocks API implementation without corresponding integration tests.
"""

import json
import sys
import os
import re
import glob


def find_api_endpoints(content: str) -> list:
    """Find API endpoint definitions in the content."""
    endpoints = []
    
    # Pattern for FastAPI route decorators
    route_patterns = [
        r'@router\.(get|post|put|patch|delete)\(["\']([^"\']+)["\']',
        r'@app\.(get|post|put|patch|delete)\(["\']([^"\']+)["\']',
    ]
    
    for pattern in route_patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            method = match.group(1).upper()
            path = match.group(2)
            line_num = content[:match.start()].count('\n') + 1
            
            endpoints.append({
                'method': method,
                'path': path,
                'line': line_num
            })
    
    return endpoints


def find_corresponding_tests(api_file_path: str, endpoints: list) -> dict:
    """Find corresponding integration tests for API endpoints."""
    test_results = {}
    
    # Determine the expected test file path
    # Convert src/brokers/api/items.py -> tests/integration/test_items.py
    api_filename = os.path.basename(api_file_path)
    test_filename = f"test_{api_filename}"
    
    # Look for test files in tests/integration/ directory
    project_root = api_file_path.split('/back/')[0] if '/back/' in api_file_path else os.path.dirname(api_file_path)
    test_patterns = [
        f"{project_root}/back/tests/integration/{test_filename}",
        f"{project_root}/back/tests/integration/test_*{api_filename}",
        f"{project_root}/back/tests/**/test_*{api_filename.replace('.py', '')}*",
    ]
    
    test_files = []
    for pattern in test_patterns:
        test_files.extend(glob.glob(pattern, recursive=True))
    
    # Check each endpoint for corresponding tests
    for endpoint in endpoints:
        endpoint_key = f"{endpoint['method']} {endpoint['path']}"
        test_results[endpoint_key] = {
            'endpoint': endpoint,
            'has_test': False,
            'test_files': [],
            'test_functions': []
        }
        
        # Search through test files for this endpoint
        for test_file in test_files:
            if os.path.exists(test_file):
                try:
                    with open(test_file, 'r', encoding='utf-8') as f:
                        test_content = f.read()
                    
                    # Look for test functions that might test this endpoint
                    test_patterns = [
                        rf'def test.*{endpoint["path"].replace("/", "_").replace("{", "").replace("}", "").lower()}',
                        rf'def test.*{endpoint["method"].lower()}.*{endpoint["path"].split("/")[-1]}',
                        rf'client\.{endpoint["method"].lower()}\(["\'].*{endpoint["path"]}',
                        rf'response.*=.*{endpoint["method"].lower()}\(["\'].*{endpoint["path"]}',
                    ]
                    
                    for pattern in test_patterns:
                        matches = re.findall(pattern, test_content, re.IGNORECASE)
                        if matches:
                            test_results[endpoint_key]['has_test'] = True
                            test_results[endpoint_key]['test_files'].append(test_file)
                            test_results[endpoint_key]['test_functions'].extend(matches)
                
                except Exception as e:
                    continue
    
    return test_results


def check_new_endpoints_vs_tests(content: str, file_path: str) -> list:
    """Check if new API endpoints have corresponding tests."""
    violations = []
    
    # Only check backend API files
    if not (file_path.endswith('.py') and '/brokers/api/' in file_path):
        return violations
    
    # Find API endpoints in the content
    endpoints = find_api_endpoints(content)
    
    if not endpoints:
        return violations
    
    # Find corresponding tests
    test_results = find_corresponding_tests(file_path, endpoints)
    
    # Check for endpoints without tests
    for endpoint_key, result in test_results.items():
        if not result['has_test']:
            violations.append({
                'type': 'missing_integration_test',
                'endpoint': result['endpoint'],
                'message': f'API endpoint {endpoint_key} has no corresponding integration test',
                'suggestion': f'Create test in tests/integration/ for {endpoint_key}'
            })
    
    return violations


def suggest_test_structure(violations: list, api_file_path: str) -> str:
    """Suggest the test structure for missing tests."""
    api_filename = os.path.basename(api_file_path).replace('.py', '')
    test_filename = f"test_{api_filename}.py"
    
    suggestion = f"""
🧪 Test-First Development Enforcement:

Missing Integration Tests Required:
"""
    
    for violation in violations:
        endpoint = violation['endpoint']
        suggestion += f"""
❌ {endpoint['method']} {endpoint['path']} (line {endpoint['line']})
   Expected test: tests/integration/{test_filename}
   Expected function: test_{endpoint['method'].lower()}_{endpoint['path'].replace('/', '_').replace('{', '').replace('}', '').lower()}
"""
    
    suggestion += f"""
📝 Create integration test template:

```python
# tests/integration/{test_filename}
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_{api_filename}_integration():
    \"\"\"Test {api_filename} API endpoints end-to-end.\"\"\"
    # Test with real database operations
    # Verify both HTTP responses AND database state changes
    pass
```

🔄 Test-First Workflow:
1. Write integration test FIRST
2. Run test and see it fail
3. Implement API endpoint
4. Run test and see it pass
5. Refactor if needed

📋 Back Agent Requirement:
ALL API development must follow test-first development.
No implementation without corresponding integration tests.
"""
    
    return suggestion


def main():
    """Main hook execution function."""
    try:
        # Read hook input from stdin
        hook_input = json.loads(sys.stdin.read())
        
        tool_name = hook_input.get('tool', '')
        file_path = hook_input.get('file_path', '')
        
        # Only check backend API files
        if not (file_path.endswith('.py') and '/brokers/api/' in file_path):
            sys.exit(0)
        
        # Get file content
        if 'new_content' in hook_input:
            content = hook_input['new_content']
        elif 'content' in hook_input:
            content = hook_input['content']
        else:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                content = ""
        
        # Check for test-first violations
        violations = check_new_endpoints_vs_tests(content, file_path)
        
        if violations:
            print("🚫 Test-First Enforcement Hook: Missing integration tests!")
            
            # Show test structure suggestion
            suggestion = suggest_test_structure(violations, file_path)
            print(suggestion)
            
            print("\n🛑 BLOCKED: API implementation without tests violates 3-tier framework.")
            print("   The Back Agent enforces MANDATORY test-first development.")
            print("\n✅ To proceed:")
            print("   1. Create integration tests FIRST")
            print("   2. Verify tests fail (red)")
            print("   3. Then implement API endpoints")
            print("   4. Verify tests pass (green)")
            
            sys.exit(1)  # Block the operation
        
        print("✅ Test-First Enforcement: All API endpoints have corresponding tests")
        sys.exit(0)
    
    except Exception as e:
        # On error, allow the operation to proceed
        print(f"⚠️ Test-First Enforcement Hook error: {e}")
        sys.exit(0)


if __name__ == '__main__':
    main()