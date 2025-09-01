# 🆘 Troubleshooting Guide

Comprehensive solutions for common issues with the Next.js + Supabase template and development environment.

## 🚀 Quick Fixes First

**🎯 Try the Smart Installer First**

Most setup issues are automatically resolved by our intelligent installer:

```bash
npm run setup
# OR
./install.sh  # Linux/Mac  
install.bat   # Windows
```

The installer detects and fixes:
- ✅ Port conflicts (finds available ports automatically)
- ✅ Missing environment files
- ✅ Docker service configuration
- ✅ Prerequisites validation

**🔄 Emergency Reset**

If you're experiencing multiple issues:

```bash
# Nuclear option - clean slate restart
npm run clean
npm run setup

# OR manually
docker-compose down
docker system prune -f --volumes
npm run setup
```

## 🐳 Docker Issues

### **"Docker command not found"**

**Problem**: Docker is not installed or not in PATH.

**Solutions**:
```bash
# Install Docker Desktop
# Windows/Mac: Download from https://docs.docker.com/desktop/
# Linux: Follow https://docs.docker.com/engine/install/

# Verify installation
docker --version
docker-compose --version
```

### **"Cannot connect to the Docker daemon"**

**Problem**: Docker service is not running.

**Solutions**:
```bash
# Windows/Mac: Open Docker Desktop app
# Linux: Start Docker service
sudo systemctl start docker

# Add user to docker group (Linux only)
sudo usermod -aG docker $USER
# Then logout and login again

# Verify Docker is running
docker info
```

### **"Port already in use" Errors**

**Problem**: Required ports are busy.

**Smart Solution** (Recommended):
```bash
# Let the intelligent installer handle it automatically
npm run setup
# It will detect available ports and reconfigure everything
```

**Manual Solution**:
```bash
# Find what's using the port (replace 5432 with your port)
lsof -i :5432  # Mac/Linux
netstat -ano | findstr :5432  # Windows

# Stop conflicting services
sudo service postgresql stop  # For PostgreSQL
pkill -f node                 # For Node.js apps  
pkill -f python               # For Python apps

# OR modify docker-compose.yml to use different ports:
# ports:
#   - "5433:5432"  # Use 5433 instead of 5432
```

### **"Services keep restarting"**

**Problem**: Docker containers are in a restart loop.

**Solutions**:
```bash
# Check service logs for specific errors
docker-compose logs [service-name]
docker-compose logs postgres
docker-compose logs api

# Common fixes:
# 1. Clean restart
docker-compose down
docker system prune -f
docker-compose up -d

# 2. Check disk space
df -h  # Should have at least 2GB free

# 3. Restart Docker Desktop (Windows/Mac)
# 4. Increase Docker memory allocation to 4GB+
```

### **"Build failed" or Image Issues**

**Problem**: Docker build fails or images won't start.

**Solutions**:
```bash
# Rebuild without cache
docker-compose build --no-cache

# Pull fresh base images
docker-compose pull

# Check Docker Desktop resources:
# - Memory: 4GB+ recommended
# - Disk space: 2GB+ free

# Windows: Enable WSL2 backend
# Mac M1/M2: Enable "Use Rosetta for x86/amd64 emulation"
```

## ⚡ Node.js and npm Issues

### **"npm install fails"**

**Problem**: Frontend dependencies won't install.

**Solutions**:
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Try different registry
npm install --registry https://registry.npmjs.org/

# Use Yarn as alternative
npm install -g yarn
yarn install

# Check Node.js version (need 18+)
node --version
# If too old, install Node.js 18+ from nodejs.org
```

### **"Cannot find module" Errors**

**Problem**: Module resolution issues in frontend.

**Solutions**:
```bash
# Ensure you're in the frontend directory
cd front
pwd  # Should end with /front

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit  # Check for TypeScript errors

# Verify imports use correct paths
# Use relative imports: ./components/MyComponent
# Not absolute: components/MyComponent
```

### **"Port 3000 already in use"**

**Problem**: Default Next.js port is busy.

**Smart Solution**:
```bash
# Use intelligent installer - it handles ports automatically
npm run setup
```

**Manual Solutions**:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
pkill -f "node.*3000"

# Or use different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

### **"Module build failed" or Webpack Errors**

**Problem**: Frontend build process fails.

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check for syntax errors in your code
npm run lint

# Verify all imported files exist
# Check for typos in import statements

# Update dependencies if needed
npm update

# Try deleting node_modules and reinstalling
rm -rf node_modules package-lock.json
npm install
```

## 🐘 Database and Supabase Issues

### **"Database connection failed"**

**Problem**: Cannot connect to PostgreSQL database.

**Solutions**:
```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# If container won't start:
docker-compose down
docker volume rm $(docker volume ls -q | grep postgres)  # ⚠️ Deletes data
docker-compose up -d postgres
```

### **"Supabase health check fails"**

**Problem**: Supabase services are not responding.

**Solutions**:
```bash
# Check all Supabase services status
docker-compose ps

# Check Kong (API Gateway) logs - most common issue
docker-compose logs kong

# Check auth service logs
docker-compose logs auth

# Restart Supabase stack
docker-compose restart kong auth rest storage realtime

# If persistent issues:
docker-compose down
docker-compose up -d
# Wait 30-60 seconds for services to initialize
```

### **"Authentication not working"**

**Problem**: User signup/login fails.

**Solutions**:
```bash
# Check auth service status
docker-compose ps auth
docker-compose logs auth

# Test auth endpoint directly
curl http://localhost:8000/auth/v1/health

# Verify environment variables
cat front/.env.local | grep SUPABASE
cat back/.env | grep SUPABASE

# Check for correct Supabase keys in .env files
# Keys should match between frontend and backend
```

### **"Real-time subscriptions not working"**

**Problem**: Supabase real-time updates not functioning.

**Solutions**:
```bash
# Check realtime service
docker-compose logs realtime

# Verify WebSocket connection in browser dev tools
# Should see WebSocket connection to ws://localhost:8000

# Check RLS policies don't block subscriptions
# Policies should allow SELECT for authenticated users

# Test with simple subscription first
# Then debug specific table/policy issues
```

## 🔍 API and Backend Issues

### **"API endpoints return 404"**

**Problem**: Backend API routes not found.

**Solutions**:
```bash
# Check if backend is running
curl http://localhost:8001/
# Should return: {"message": "Next.js Supabase API is running"}

# Check backend logs
docker-compose logs api

# Restart API service
docker-compose restart api

# Verify API routes are registered
# Check main.py for app.include_router() calls

# Test specific endpoints
curl http://localhost:8001/docs  # FastAPI docs
```

### **"500 Internal Server Error"**

**Problem**: Backend API throwing server errors.

**Solutions**:
```bash
# Check detailed API logs
docker-compose logs api --tail 50

# Common issues:
# 1. Database connection problems
# 2. Missing environment variables
# 3. Import errors in Python code
# 4. Unhandled exceptions

# Test with simpler endpoint first
curl http://localhost:8001/health

# Check Python dependencies
docker-compose exec api pip list
```

### **"CORS errors in browser"**

**Problem**: Frontend can't connect to backend due to CORS.

**Solutions**:
```bash
# Check backend CORS configuration in main.py
# Should include your frontend URL

# Verify environment variables
cat front/.env.local | grep API_BASE_URL
# Should be: NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# Check frontend is making requests to correct URL
# Browser Network tab should show requests to :8001

# Restart both frontend and backend
docker-compose restart api
cd front && npm run dev
```

## 🔐 Authentication and Authorization Issues

### **"Users can't stay logged in"**

**Problem**: Session persistence issues.

**Solutions**:
```bash
# Check Supabase auth configuration
curl http://localhost:8000/auth/v1/settings

# Verify JWT tokens are being stored correctly
# Check browser localStorage/sessionStorage

# Check for conflicting auth logic
# Frontend and backend should use same Supabase instance

# Test with incognito/private browsing mode
# Rules out browser extension interference
```

### **"Permission denied" errors**

**Problem**: Row Level Security (RLS) blocking operations.

**Solutions**:
```bash
# Check RLS policies in Supabase dashboard
# http://localhost:8000 -> Authentication -> Policies

# Test with RLS disabled temporarily (dev only)
# ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

# Common RLS issues:
# 1. Policies too restrictive
# 2. User context not passed correctly  
# 3. Policy conditions don't match user attributes

# Debug with direct SQL in Supabase dashboard
```

## 💻 System-Specific Issues

### **Windows Users**

#### **PowerShell Execution Policy**
```bash
# If scripts won't run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run install script:
.\install.bat
```

#### **WSL2 Docker Issues**
```bash
# Enable WSL2 for better Docker performance
wsl --install

# Update WSL2 kernel
wsl --update

# Restart Docker Desktop after WSL2 setup
```

#### **File Path Issues**
```bash
# Use forward slashes in paths:
cd front/src  # Instead of front\src

# If getting "file not found":
# Check file actually exists with dir command
dir front\package.json
```

### **Mac Users (M1/M2)**

#### **Docker Platform Issues**
```bash
# Enable Rosetta emulation in Docker Desktop:
# Settings > General > "Use Rosetta for x86/amd64 emulation"

# Or specify platform in docker-compose.yml:
# platform: linux/amd64
```

#### **npm Install Failures**
```bash
# Use ARM64 Node.js
arch -arm64 brew install node

# Or use Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### **Linux Users**

#### **Docker Permission Issues**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, then test:
docker run hello-world

# If still issues, restart Docker:
sudo systemctl restart docker
```

#### **Port Binding Issues**
```bash
# If ports < 1024 are restricted:
sudo setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/node

# Or use ports > 1024 (installer handles this automatically)
```

## 🔍 Advanced Debugging

### **Comprehensive System Check**

```bash
# Run this script to gather debug information:

echo "=== System Information ==="
echo "OS: $(uname -s)"
echo "Docker: $(docker --version)"
echo "Node: $(node --version)"  
echo "Python: $(python --version 2>/dev/null || python3 --version)"
echo "npm: $(npm --version)"

echo -e "\n=== Service Status ==="
docker-compose ps

echo -e "\n=== Port Usage ==="
netstat -tuln | grep -E ':(3000|5432|8000|8001|9000)' || echo "No conflicts found"

echo -e "\n=== Docker Resources ==="
docker system df

echo -e "\n=== Recent Logs (last 20 lines) ==="
docker-compose logs --tail=20
```

### **Service Health Checks**

```bash
# Test all services systematically:

# 1. PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# 2. Supabase API Gateway
curl -s http://localhost:8000/health | head -5

# 3. Backend API
curl -s http://localhost:8001/ | head -5

# 4. Frontend (if running)
curl -s http://localhost:3000 | head -5

# 5. Email UI
curl -s http://localhost:9000 | head -5
```

### **Log Analysis**

```bash
# View logs by service:
docker-compose logs postgres    # Database logs
docker-compose logs kong       # API Gateway logs
docker-compose logs auth       # Authentication logs
docker-compose logs api        # Backend API logs

# Follow logs in real-time:
docker-compose logs -f api

# Filter logs by error level:
docker-compose logs api | grep -i error
docker-compose logs api | grep -i warning
```

## 🆘 Getting Help

If you're still experiencing issues after trying these solutions:

### **Information to Include When Asking for Help**

```bash
# Run this comprehensive diagnostic:
echo "=== Environment ==="
echo "OS: $(uname -s)"
echo "Docker: $(docker --version)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

echo -e "\n=== Service Status ==="
docker-compose ps

echo -e "\n=== Error Logs ==="
docker-compose logs --tail=50

echo -e "\n=== Port Configuration ==="
cat .dev-ports.json 2>/dev/null || echo "No port config found"

echo -e "\n=== Environment Files ==="
echo "Frontend .env.local exists: $(test -f front/.env.local && echo 'Yes' || echo 'No')"
echo "Backend .env exists: $(test -f back/.env && echo 'Yes' || echo 'No')"
```

### **Support Channels**

1. **Check existing documentation** first:
   - **🚀 [QUICK-START.md](./QUICK-START.md)** - Fast setup guide
   - **🛠️ [SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Detailed setup options
   - **🤖 [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** - Framework usage
   - **📋 [CLAUDE.md](./CLAUDE.md)** - Claude Code integration

2. **Try the emergency reset**:
   ```bash
   npm run clean && npm run setup
   ```

3. **Gather diagnostic information** using the scripts above

4. **Include specific error messages** and what you were trying to do

### **Common Resolution Steps**

Most issues resolve with this sequence:

1. **Check prerequisites**: Node.js 18+, Docker running, ports available
2. **Clean restart**: `npm run clean && npm run setup`  
3. **Check logs**: `docker-compose logs` for specific errors
4. **Verify configuration**: Environment files and ports
5. **System-specific fixes**: Follow OS-specific troubleshooting above

## 📚 Related Documentation

For more comprehensive guidance:
- **🚀 [QUICK-START.md](./QUICK-START.md)** - Get up and running in 5 minutes
- **🛠️ [SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Alternative setup methods and configurations
- **🤖 [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** - Master the 3-tier Claude Code framework
- **⚙️ [INSTALL-GUIDE.md](./INSTALL-GUIDE.md)** - Technical details of the smart installer
- **📋 [CLAUDE.md](./CLAUDE.md)** - Claude Code integration and daily commands
- **📖 [README.md](./README.md)** - Complete project overview

---

**Remember: The intelligent installer (`npm run setup`) resolves most common issues automatically! 🚀**