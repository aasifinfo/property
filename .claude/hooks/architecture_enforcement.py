#!/usr/bin/env python3
"""
Architecture Enforcement Hook (PreToolUse)
Validates adherence to DocumentBase patterns and prevents direct database access.
"""

import json
import sys
import re
import os


def check_direct_supabase_access(content: str, file_path: str) -> list:
    """Check for direct Supabase database access violations."""
    violations = []
    
    # Pattern for direct supabase table access (Python backend)
    direct_db_patterns = [
        r'supabase\.table\(',
        r'supabase\.from\(',
        r'client\.table\(',
        r'client\.from\(',
    ]
    
    for pattern in direct_db_patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            line_num = content[:match.start()].count('\n') + 1
            violations.append({
                'type': 'direct_database_access',
                'file': file_path,
                'line': line_num,
                'message': f'Direct Supabase access detected. Use DocumentBase classes instead.',
                'pattern': pattern
            })
    
    return violations


def check_documentbase_usage(content: str, file_path: str) -> list:
    """Check for proper DocumentBase patterns in backend files."""
    violations = []
    
    # Only check Python files in backend
    if not (file_path.endswith('.py') and '/back/' in file_path):
        return violations
    
    # Check if file is in brokers/api/ (API endpoints)
    if '/brokers/api/' in file_path:
        # API files should use DocumentBase classes for database operations
        has_document_import = re.search(r'from.*documents.*import', content)
        has_db_operations = re.search(r'\.(create|update|delete|select)\(', content)
        
        if has_db_operations and not has_document_import:
            violations.append({
                'type': 'missing_documentbase',
                'file': file_path,
                'line': 1,
                'message': 'API file with database operations must import and use DocumentBase classes.',
                'pattern': 'documentbase_pattern'
            })
    
    return violations


def check_supabase_client_wrapper(content: str, file_path: str) -> list:
    """Check for proper SupabaseClient wrapper usage."""
    violations = []
    
    # Only check Python backend files
    if not (file_path.endswith('.py') and '/back/' in file_path):
        return violations
    
    # Check for direct supabase client initialization
    direct_init_patterns = [
        r'create_client\(',
        r'Client\(',
    ]
    
    for pattern in direct_init_patterns:
        if re.search(pattern, content) and 'SupabaseClient' not in content:
            violations.append({
                'type': 'bypass_supabase_wrapper',
                'file': file_path,
                'line': 1,
                'message': 'Use SupabaseClient wrapper instead of direct Supabase client initialization.',
                'pattern': pattern
            })
    
    return violations


def check_frontend_patterns(content: str, file_path: str) -> list:
    """Check for proper frontend architectural patterns."""
    violations = []
    
    # Only check TypeScript/React files
    if not (file_path.endswith(('.tsx', '.ts')) and '/front/' in file_path):
        return violations
    
    # Check for proper Material-UI usage in components
    if '/components/' in file_path:
        has_mui_import = re.search(r'from [\'"]@mui/', content)
        has_jsx = re.search(r'<[A-Z]', content)  # React components
        
        if has_jsx and not has_mui_import and 'index.ts' not in file_path:
            violations.append({
                'type': 'missing_mui_foundation',
                'file': file_path,
                'line': 1,
                'message': 'React components should use Material-UI as foundation. Import from @mui/*',
                'pattern': 'mui_pattern'
            })
    
    return violations


def main():
    """Main hook execution function."""
    try:
        # Read hook input from stdin
        hook_input = json.loads(sys.stdin.read())
        
        tool_name = hook_input.get('tool', '')
        file_path = hook_input.get('file_path', '')
        
        # Get file content from the hook input
        if 'new_content' in hook_input:
            content = hook_input['new_content']
        elif 'content' in hook_input:
            content = hook_input['content']
        else:
            # If no content in hook input, try to read from file
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                content = ""
        
        # Run architecture checks
        violations = []
        violations.extend(check_direct_supabase_access(content, file_path))
        violations.extend(check_documentbase_usage(content, file_path))
        violations.extend(check_supabase_client_wrapper(content, file_path))
        violations.extend(check_frontend_patterns(content, file_path))
        
        # If violations found, block the operation
        if violations:
            print("🚫 Architecture Enforcement Hook: Violations detected!")
            print("\n3-Tier Framework Architecture Violations:")
            
            for violation in violations:
                print(f"\n❌ {violation['message']}")
                print(f"   File: {violation['file']}:{violation['line']}")
                print(f"   Type: {violation['type']}")
            
            print("\n📖 Architecture Guidelines:")
            print("   • Use DocumentBase classes for all database operations")
            print("   • Use SupabaseClient wrapper instead of direct Supabase client")
            print("   • Frontend components should use Material-UI foundation")
            print("   • Follow the 3-tier agentic framework patterns")
            
            print("\n🔧 How to fix:")
            print("   • Backend: Import DocumentBase classes from src/documents/")
            print("   • Backend: Use SupabaseClient.get_instance() for database access")  
            print("   • Frontend: Import components from @mui/material")
            
            sys.exit(1)  # Block the operation
        
        # If no violations, allow the operation
        print("✅ Architecture Enforcement: No violations detected")
        sys.exit(0)
    
    except Exception as e:
        # On error, allow the operation to proceed
        print(f"⚠️ Architecture Enforcement Hook error: {e}")
        sys.exit(0)


if __name__ == '__main__':
    main()