#!/usr/bin/env python3
"""
ADR Documentation Hook (PostToolUse)
Prompts for ADR updates when architectural files are modified.
"""

import json
import sys
import os
import re


def is_architectural_change(file_path: str, content: str) -> dict:
    """Determine if the file change requires ADR documentation."""
    architectural_indicators = {
        'backend': {
            'paths': ['/back/src/documents/', '/back/src/brokers/api/', '/back/supabase/'],
            'patterns': [
                r'class.*\(DocumentBase\)',  # New DocumentBase classes
                r'CREATE TABLE',  # Database schema changes
                r'CREATE POLICY',  # RLS policy changes
                r'@router\.',  # New API endpoints
                r'async def.*\(',  # New async functions
            ]
        },
        'frontend': {
            'paths': ['/front/components/', '/front/theme/', '/front/src/'],
            'patterns': [
                r'createTheme\(',  # Theme modifications
                r'export const.*Component',  # New components
                r'Context\s*=',  # New contexts
                r'useContext\(',  # Context usage patterns
                r'createContext\(',  # Context creation
            ]
        },
        'agents': {
            'paths': ['/.claude/agents/'],
            'patterns': [
                r'## Your Core Responsibilities',  # Agent role changes
                r'### Primary Tasks',  # Task modifications
                r'### Architecture.*You.*Follow',  # Architecture pattern changes
            ]
        }
    }
    
    result = {'requires_adr': False, 'domain': None, 'reasons': []}
    
    for domain, config in architectural_indicators.items():
        # Check if file path matches domain
        path_match = any(path in file_path for path in config['paths'])
        
        if path_match:
            result['domain'] = domain
            
            # Check for architectural patterns in content
            for pattern in config['patterns']:
                if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
                    result['requires_adr'] = True
                    result['reasons'].append(f"Detected pattern: {pattern}")
    
    return result


def get_adr_file_path(domain: str) -> str:
    """Get the appropriate ADR file path for the domain."""
    if domain == 'frontend':
        return 'front/.claude/rules/ADR.mdc'
    else:
        return 'back/.claude/rules/ADR.mdc'


def suggest_adr_content(file_path: str, domain: str, reasons: list) -> str:
    """Suggest ADR content based on the changes detected."""
    suggestions = {
        'backend': {
            'title_hints': ['Database Schema Change', 'API Endpoint Pattern', 'DocumentBase Pattern', 'RLS Policy Strategy'],
            'context_hints': [
                'New database table or schema modification requiring documentation',
                'New API endpoint pattern that may be reused across the application',
                'DocumentBase class pattern affecting multiple document types',
                'Row Level Security policy approach for data access control'
            ]
        },
        'frontend': {
            'title_hints': ['Component Pattern', 'Theme System Change', 'State Management Pattern', 'UI Architecture'],
            'context_hints': [
                'New component pattern that establishes design system standards',
                'Material-UI theme modification affecting global styling',
                'React Context pattern for state management',
                'UI architecture decision affecting component composition'
            ]
        },
        'agents': {
            'title_hints': ['Agent Responsibility Change', '3-Tier Framework Update', 'Delegation Pattern'],
            'context_hints': [
                'Change to agent responsibilities or coordination patterns',
                'Modification to 3-tier framework delegation rules',
                'New architectural pattern affecting multiple agents'
            ]
        }
    }
    
    domain_suggestions = suggestions.get(domain, suggestions['backend'])
    
    suggestion_text = f"""
📝 ADR Documentation Suggestion:

File: {file_path}
Domain: {domain.title()}
Detected Changes: {', '.join(reasons)}

Suggested ADR Topics:
"""
    
    for i, title in enumerate(domain_suggestions['title_hints'][:3]):
        context = domain_suggestions['context_hints'][i] if i < len(domain_suggestions['context_hints']) else ""
        suggestion_text += f"  {i+1}. {title} - {context}\n"
    
    return suggestion_text


def main():
    """Main hook execution function."""
    try:
        # Read hook input from stdin
        hook_input = json.loads(sys.stdin.read())
        
        tool_name = hook_input.get('tool', '')
        file_path = hook_input.get('file_path', '')
        
        # Skip if not relevant file types
        if not any(file_path.endswith(ext) for ext in ['.py', '.tsx', '.ts', '.md', '.sql']):
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
        
        # Check if this change requires ADR documentation
        adr_analysis = is_architectural_change(file_path, content)
        
        if adr_analysis['requires_adr']:
            print("📋 ADR Documentation Hook: Architectural change detected!")
            print(f"\n🏗️ Architecture Change Analysis:")
            print(f"   File: {file_path}")
            print(f"   Domain: {adr_analysis['domain'].title()}")
            print(f"   Changes detected: {len(adr_analysis['reasons'])}")
            
            # Show suggested ADR content
            suggestion = suggest_adr_content(file_path, adr_analysis['domain'], adr_analysis['reasons'])
            print(suggestion)
            
            adr_file = get_adr_file_path(adr_analysis['domain'])
            print(f"💡 Consider updating: {adr_file}")
            
            print("\n🔄 Next Steps:")
            print("   1. Review the architectural change for broader impact")
            print("   2. Document the decision rationale in the appropriate ADR file")
            print("   3. Include alternatives considered and consequences")
            print("   4. Reference the ADR number in related code comments")
            
            print(f"\n📖 ADR Protocol:")
            print(f"   • Follow the ADR_AGENT_PROTOCOL v1.0 format")
            print(f"   • Use proper ID numbering (B### for backend, F### for frontend)")
            print(f"   • Update the index table with the new entry")
        else:
            print("✅ ADR Documentation: No architectural changes requiring documentation")
        
        # Always allow the operation to proceed (PostToolUse is informational)
        sys.exit(0)
    
    except Exception as e:
        # On error, allow the operation to proceed
        print(f"⚠️ ADR Documentation Hook error: {e}")
        sys.exit(0)


if __name__ == '__main__':
    main()