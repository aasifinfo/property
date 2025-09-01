#!/bin/bash

# Smart Install Script for Next.js + Supabase Template
# Automatically detects available ports and configures the entire stack

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print colored output
print() {
    echo -e "$1$2${NC}"
}

# Print step header
print_step() {
    echo
    print "${CYAN}${BOLD}" "$1. $2"
}

# Check if a port is available
is_port_available() {
    local port=$1
    if command -v nc >/dev/null 2>&1; then
        ! nc -z localhost $port 2>/dev/null
    elif command -v netstat >/dev/null 2>&1; then
        ! netstat -tuln 2>/dev/null | grep -q ":$port "
    elif command -v lsof >/dev/null 2>&1; then
        ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    else
        # Fallback: try to bind to the port
        (echo >/dev/tcp/localhost/$port) 2>/dev/null && return 1 || return 0
    fi
}

# Find available port starting from base port
find_available_port() {
    local base_port=$1
    local max_tries=${2:-50}
    local port=$base_port
    local tries=0
    
    while [ $tries -lt $max_tries ]; do
        if is_port_available $port; then
            echo $port
            return 0
        fi
        ((port++))
        ((tries++))
    done
    
    print "${RED}" "❌ Could not find available port starting from $base_port"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    print_step "🔍" "Checking prerequisites..."
    
    local failed=false
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        print "${GREEN}" "  ✅ Node.js: $node_version"
        
        # Check if version is 18+
        local major_version=$(echo $node_version | sed 's/v//' | cut -d. -f1)
        if [ "$major_version" -lt 18 ]; then
            print "${YELLOW}" "    ⚠️  Warning: Node.js 18+ recommended"
        fi
    else
        print "${RED}" "  ❌ Node.js: Not found"
        failed=true
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        print "${GREEN}" "  ✅ npm: $npm_version"
    else
        print "${RED}" "  ❌ npm: Not found"
        failed=true
    fi
    
    # Check Docker
    if command -v docker >/dev/null 2>&1; then
        local docker_version=$(docker --version | cut -d' ' -f3 | sed 's/,//')
        print "${GREEN}" "  ✅ Docker: $docker_version"
    else
        print "${RED}" "  ❌ Docker: Not found"
        failed=true
    fi
    
    # Check Docker Compose
    if command -v docker-compose >/dev/null 2>&1; then
        local compose_version=$(docker-compose --version | cut -d' ' -f3 | sed 's/,//')
        print "${GREEN}" "  ✅ Docker Compose: $compose_version"
    else
        print "${RED}" "  ❌ Docker Compose: Not found"
        failed=true
    fi
    
    if [ "$failed" = true ]; then
        print "${RED}" ""
        print "${RED}" "❌ Some prerequisites are missing. Please install them first."
        print "${YELLOW}" "See the README.md for installation instructions."
        exit 1
    fi
    
    print "${GREEN}" "  🎉 All prerequisites are installed!"
}

# Detect available ports
detect_ports() {
    print_step "🔍" "Detecting available ports..."
    
    # Default ports for services
    local postgres_default=5432
    local kong_default=8000  
    local api_default=8001
    local frontend_default=3000
    local email_default=9000
    
    # Find available ports
    POSTGRES_PORT=$(find_available_port $postgres_default)
    KONG_PORT=$(find_available_port $kong_default)
    API_PORT=$(find_available_port $api_default) 
    FRONTEND_PORT=$(find_available_port $frontend_default)
    EMAIL_PORT=$(find_available_port $email_default)
    
    # Display results
    if [ "$POSTGRES_PORT" = "$postgres_default" ]; then
        print "${GREEN}" "  ✅ PostgreSQL Database: $POSTGRES_PORT (default)"
    else
        print "${YELLOW}" "  🔄 PostgreSQL Database: $POSTGRES_PORT ($postgres_default was busy)"
    fi
    
    if [ "$KONG_PORT" = "$kong_default" ]; then
        print "${GREEN}" "  ✅ Supabase API Gateway: $KONG_PORT (default)"
    else
        print "${YELLOW}" "  🔄 Supabase API Gateway: $KONG_PORT ($kong_default was busy)"
    fi
    
    if [ "$API_PORT" = "$api_default" ]; then
        print "${GREEN}" "  ✅ FastAPI Backend: $API_PORT (default)"
    else
        print "${YELLOW}" "  🔄 FastAPI Backend: $API_PORT ($api_default was busy)"
    fi
    
    if [ "$FRONTEND_PORT" = "$frontend_default" ]; then
        print "${GREEN}" "  ✅ Next.js Frontend: $FRONTEND_PORT (default)"
    else
        print "${YELLOW}" "  🔄 Next.js Frontend: $FRONTEND_PORT ($frontend_default was busy)"
    fi
    
    if [ "$EMAIL_PORT" = "$email_default" ]; then
        print "${GREEN}" "  ✅ Email UI (Inbucket): $EMAIL_PORT (default)"
    else
        print "${YELLOW}" "  🔄 Email UI (Inbucket): $EMAIL_PORT ($email_default was busy)"
    fi
}

# Generate Docker Compose configuration
generate_docker_compose() {
    print_step "📝" "Generating Docker Compose configuration..."
    
    # Create docker-compose.override.yml from template
    if [ -f "docker-compose.template.yml" ]; then
        sed -e "s/{{POSTGRES_PORT}}/$POSTGRES_PORT/g" \
            -e "s/{{KONG_PORT}}/$KONG_PORT/g" \
            -e "s/{{API_PORT}}/$API_PORT/g" \
            -e "s/{{EMAIL_PORT}}/$EMAIL_PORT/g" \
            docker-compose.template.yml > docker-compose.override.yml
    else
        # Fallback: modify existing docker-compose.yml
        sed -e "s/:5432\":/:$POSTGRES_PORT\":/g" \
            -e "s/:8000\":/:$KONG_PORT\":/g" \
            -e "s/:8001\":/:$API_PORT\":/g" \
            -e "s/:9000\":/:$EMAIL_PORT\":/g" \
            docker-compose.yml > docker-compose.override.yml
    fi
    
    print "${GREEN}" "  ✅ Docker Compose configuration generated"
}

# Generate environment files
generate_environment_files() {
    print_step "⚙️" "Generating environment configuration..."
    
    # Create frontend environment file
    mkdir -p front
    cat > front/.env.local << EOF
# Auto-generated environment variables
NEXT_PUBLIC_SUPABASE_URL=http://localhost:${KONG_PORT}
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_API_BASE_URL=http://localhost:${API_PORT}

# Port configuration (for reference)
FRONTEND_PORT=${FRONTEND_PORT}
EOF
    
    # Create backend environment file
    mkdir -p back
    cat > back/.env << EOF
# Auto-generated environment variables
SUPABASE_URL=http://localhost:${KONG_PORT}
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
ENV=development

# Port configuration (for reference)  
API_PORT=${API_PORT}
DATABASE_PORT=${POSTGRES_PORT}
EOF
    
    print "${GREEN}" "  ✅ Environment files generated"
}

# Start Docker services
start_docker_services() {
    print_step "🐳" "Starting Docker services..."
    print "${YELLOW}" "  This may take a few minutes on first run (downloading images)..."
    
    if docker-compose up -d; then
        print "${GREEN}" "  ✅ Docker services started successfully"
    else
        print "${RED}" "  ❌ Failed to start Docker services"
        print "${YELLOW}" "  Try: docker-compose down && docker system prune -f"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend_dependencies() {
    print_step "📦" "Installing frontend dependencies..."
    
    cd front
    if npm install; then
        print "${GREEN}" "  ✅ Frontend dependencies installed"
        cd ..
    else
        print "${RED}" "  ❌ Failed to install frontend dependencies"
        exit 1
    fi
}

# Verify services
verify_services() {
    print_step "🔍" "Verifying services are running..."
    
    # Wait for services to start
    sleep 5
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        print "${GREEN}" "  ✅ PostgreSQL: Running on port $POSTGRES_PORT"
    else
        print "${YELLOW}" "  ⚠️  PostgreSQL: Started but not responding yet"
    fi
    
    # Check Supabase API Gateway (basic connectivity)
    if curl -sf "http://localhost:$KONG_PORT/health" >/dev/null 2>&1; then
        print "${GREEN}" "  ✅ Supabase API Gateway: Running on port $KONG_PORT"
    else
        print "${YELLOW}" "  ⚠️  Supabase API Gateway: Started but not responding yet"
    fi
}

# Save port configuration
save_port_configuration() {
    cat > .dev-ports.json << EOF
{
  "ports": {
    "postgres": $POSTGRES_PORT,
    "kong": $KONG_PORT,
    "api": $API_PORT,
    "frontend": $FRONTEND_PORT,
    "email": $EMAIL_PORT
  },
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "services": {
    "frontend": "http://localhost:$FRONTEND_PORT",
    "api": "http://localhost:$API_PORT",
    "database": "localhost:$POSTGRES_PORT",
    "supabase": "http://localhost:$KONG_PORT",
    "email": "http://localhost:$EMAIL_PORT"
  }
}
EOF
}

# Display success message
display_success_message() {
    echo
    print "${GREEN}" "============================================================"
    print "${GREEN}" "🎉 Setup Complete! Your development environment is ready."
    print "${GREEN}" "============================================================"
    
    echo
    print "${BOLD}" "Services running on:"
    print "${CYAN}" "├── 🌐 Frontend:     http://localhost:$FRONTEND_PORT"
    print "${CYAN}" "├── ⚡ API:          http://localhost:$API_PORT"
    print "${CYAN}" "├── 🗄️  Database:    localhost:$POSTGRES_PORT"
    print "${CYAN}" "├── 🔐 Supabase:     http://localhost:$KONG_PORT"
    print "${CYAN}" "└── 📧 Email UI:     http://localhost:$EMAIL_PORT"
    
    echo
    print "${BOLD}" "Next steps:"
    print "${YELLOW}" "1. Start frontend: cd front && npm run dev"
    print "${YELLOW}" "2. Open http://localhost:$FRONTEND_PORT in your browser"
    print "${YELLOW}" "3. Start coding! The 3-tier Claude framework is ready."
    
    echo
    print "${BOLD}" "💡 Tips:"
    print "${CYAN}" "• Your port configuration is saved in .dev-ports.json"
    print "${CYAN}" "• Run \"docker-compose down\" to stop services"
    print "${CYAN}" "• Run \"docker-compose up -d\" to restart services"
    print "${CYAN}" "• Need help? Check the troubleshooting guide in README.md"
}

# Main installation process
main() {
    print "${BOLD}" "🚀 Smart Setup for Next.js + Supabase Template"
    echo "This script will automatically configure your development environment"
    echo
    
    check_prerequisites
    detect_ports
    generate_docker_compose
    generate_environment_files
    start_docker_services
    install_frontend_dependencies
    
    print "${YELLOW}" ""
    print "${YELLOW}" "⏳ Waiting for services to fully initialize..."
    sleep 5
    
    verify_services
    save_port_configuration
    display_success_message
}

# Error handling
trap 'echo -e "\n${RED}❌ Setup failed. Check the error above.${NC}"' ERR

# Run the installer
main "$@"