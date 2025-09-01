# 🛠️ Complete Setup Guide

Comprehensive setup instructions for the Next.js + Supabase template with all alternative methods and detailed configurations.

## 📋 Prerequisites & System Requirements

### **🔍 Check Your System First**

Run these commands to verify your current setup:

```bash
# Check if Node.js is installed (need 18+)
node --version

# Check if Python is installed (need 3.11+)
python --version || python3 --version

# Check if Docker is installed
docker --version

# Check if Docker Compose is installed
docker-compose --version

# Check if Git is installed
git --version
```

### **📝 Required Software**

#### **1. Node.js 18+**
- **Windows/Mac**: Download from [nodejs.org](https://nodejs.org/)
- **Linux (Ubuntu/Debian)**: 
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **Mac with Homebrew**: `brew install node`

#### **2. Python 3.11+**
- **Windows**: Download from [python.org](https://python.org/) 
- **Mac**: `brew install python@3.11`
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install python3.11 python3.11-pip python3.11-venv
  ```

#### **3. Docker & Docker Compose**
- **Windows/Mac**: Download [Docker Desktop](https://docs.docker.com/desktop/) (includes Docker Compose)
- **Linux**: Follow [Docker Engine](https://docs.docker.com/engine/install/) + [Docker Compose](https://docs.docker.com/compose/install/) guides

**✅ Verify Docker Installation:**
```bash
docker run hello-world
# Should download and run successfully
```

#### **4. Git** 
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **Mac**: `brew install git` or use Xcode Command Line Tools
- **Linux**: `sudo apt install git`

### **🚨 Port Availability Check**

The project uses these default ports. Check availability:

```bash
# Check if required ports are free (should return nothing if available)
netstat -tuln | grep -E ':(3000|5432|8000|8001|9000)'

# Alternative check on Mac/Linux
lsof -i :3000 -i :5432 -i :8000 -i :8001 -i :9000

# On Windows (PowerShell)
netstat -ano | findstr -E ":(3000|5432|8000|8001|9000)"
```

**Port Usage:**
| Port | Service | Purpose |
|------|---------|---------|
| 3000 | Next.js Frontend | Web application UI |
| 5432 | PostgreSQL | Database server |
| 8000 | Supabase API Gateway | API routing and auth |
| 8001 | FastAPI Backend | Custom API endpoints |
| 9000 | Email UI (Inbucket) | Email testing interface |

**If ports are busy:** Our intelligent installer automatically finds alternative ports, so you don't need to manually stop services!

### **⚠️ Important System Notes**

- **Docker Desktop must be running** before starting the project
- **Windows users**: Enable WSL2 for better Docker performance
- **Mac users**: Allocate at least 4GB RAM to Docker Desktop
- **Linux users**: Add your user to docker group: `sudo usermod -aG docker $USER` (then logout/login)

## 🚀 Setup Methods

### **Method 1: Intelligent Installer (Recommended)**

The easiest way with automatic port detection and configuration:

```bash
# Clone and enter the repository
git clone <your-repo-url>
cd nextjs-firebase-ai-coding-template

# Run the intelligent installer
npm run setup
# OR choose your platform-specific version:
./install.sh        # Linux/Mac (optimized)
install.bat         # Windows (PowerShell integration)
```

**What the installer does:**
1. **Prerequisite Check** - Verifies Node.js, Docker, npm, Docker Compose
2. **Port Detection** - Finds available ports for all services
3. **Configuration Generation** - Creates docker-compose.override.yml and .env files
4. **Service Startup** - Starts all Docker services with detected ports
5. **Dependency Installation** - Runs npm install for frontend
6. **Verification** - Confirms all services are running correctly

**After installation:**
```bash
# Start development (services already running)
cd front && npm run dev

# Open your browser to the detected frontend port
# (installer will show you the URL)
```

### **Method 2: Manual Docker Setup**

For users who want full control over the process:

```bash
# 1. Clone repository
git clone <your-repo-url>
cd nextjs-firebase-ai-coding-template

# 2. Create environment files
cp front/.env.local.example front/.env.local
cp back/.env.example back/.env

# 3. Customize ports in docker-compose.yml if needed
# Edit the ports section to avoid conflicts

# 4. Start Docker services
docker-compose up -d

# 5. Install frontend dependencies
cd front && npm install

# 6. Start frontend development server
npm run dev

# 7. Verify services are running
docker-compose ps
curl http://localhost:8001/  # Test API
curl http://localhost:8000/health  # Test Supabase
```

### **Method 3: Cloud Development (No Local Setup)**

**Perfect for beginners who want to avoid local setup entirely.**

#### **Gitpod (Recommended)**
1. Click: [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#your-repo-url)
2. Wait for the environment to load (2-3 minutes)
3. All services start automatically
4. Your app will be available at the generated URLs

#### **GitHub Codespaces**
1. Go to your GitHub repository
2. Click "Code" → "Codespaces" → "New codespace"
3. Wait for setup to complete
4. Run: `npm run setup`

#### **CodeSandbox**
1. Go to [CodeSandbox](https://codesandbox.io/)
2. Import your GitHub repository
3. **Note**: Limited to frontend development only

### **Method 4: Manual Local Setup (No Docker)**

**For users who prefer not to use Docker:**

#### **Requirements**
- PostgreSQL 15+ installed locally
- Node.js 18+
- Python 3.11+

#### **Setup Steps**

**1. Install PostgreSQL**
```bash
# Mac with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

**2. Create Database**
```bash
# Create database and user
createdb supabase_template
psql -d supabase_template -c "CREATE USER supabase WITH PASSWORD 'password';"
psql -d supabase_template -c "GRANT ALL PRIVILEGES ON DATABASE supabase_template TO supabase;"
```

**3. Setup Environment Variables**
```bash
# Create front/.env.local
cat > front/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
EOF

# Create back/.env
cat > back/.env << EOF
DATABASE_URL=postgresql://supabase:password@localhost:5432/supabase_template
SUPABASE_URL=http://localhost:54321
ENV=development
EOF
```

**4. Start Services**
```bash
# Terminal 1: Start Backend
cd back
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start Frontend
cd front
npm install
npm run dev
```

**Note:** Manual setup requires configuring authentication and storage services separately.

### **Method 5: Simplified Docker (Fewer Services)**

**For users who want Docker but with minimal complexity:**

Create a simplified `docker-compose.simple.yml`:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: supabase_template
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./back
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/supabase_template
      - ENV=development
    ports:
      - "8001:8000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose -f docker-compose.simple.yml up -d
cd front && npm install && npm run dev
```

### **Method 6: Production Supabase (Cloud)**

**Skip local Supabase entirely by using the cloud version:**

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Note your project URL and keys

2. **Update Environment Variables**
```bash
# front/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# back/.env  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENV=development
```

3. **Start Only Your Services**
```bash
# Start your backend
cd back
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Start your frontend
cd front
npm install && npm run dev
```

## 🎯 Which Method Should I Choose?

| Method | Complexity | Features | Best For |
|--------|------------|----------|----------|
| **Intelligent Installer** | ⭐ Easy | ⭐⭐⭐ Full | **Everyone (Recommended)** |
| **Manual Docker** | ⭐⭐ Medium | ⭐⭐⭐ Full | Users who want control |
| **Cloud Development** | ⭐ Easy | ⭐⭐ Limited | Complete beginners |
| **Manual Local** | ⭐⭐⭐ Hard | ⭐⭐ Partial | Advanced users, no Docker |
| **Simplified Docker** | ⭐⭐ Medium | ⭐⭐ Partial | Learning/lightweight dev |
| **Production Supabase** | ⭐⭐ Medium | ⭐⭐⭐ Full | Real service testing |

**👍 Recommendation:** Start with the **Intelligent Installer** - it handles everything automatically and works in most scenarios.

## 🔧 Configuration Details

### **Environment Variables**

#### **Frontend (.env.local)**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration  
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# Development Settings
NEXT_PUBLIC_ENV=development
```

#### **Backend (.env)**
```env
# Supabase Configuration
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Settings
ENV=development
API_PORT=8001
DATABASE_PORT=5432
```

#### **Generated Port Configuration (.dev-ports.json)**
```json
{
  "ports": {
    "postgres": 5432,
    "kong": 8000,
    "api": 8001,
    "frontend": 3000,
    "email": 9000
  },
  "services": {
    "frontend": "http://localhost:3000",
    "api": "http://localhost:8001", 
    "database": "localhost:5432",
    "supabase": "http://localhost:8000",
    "email": "http://localhost:9000"
  },
  "generatedAt": "2025-09-01T10:17:32.977Z"
}
```

### **Docker Compose Services**

The template includes these services:

- **postgres**: PostgreSQL database
- **kong**: Supabase API gateway and auth
- **auth**: Supabase authentication service
- **rest**: PostgREST API for database access
- **realtime**: Supabase real-time subscriptions
- **storage**: Supabase file storage service
- **imgproxy**: Image optimization service
- **inbucket**: Email testing service
- **api**: Your custom FastAPI backend

## 📱 Daily Development Workflow

After initial setup, your daily routine:

```bash
# Start everything (if not already running)
npm run dev

# Check service status
npm run status

# View logs if needed
npm run logs

# Stop services at end of day
npm run stop

# Clean restart if issues
npm run clean
```

## 🔄 Updating the Template

To update your project with template improvements:

```bash
# Add the template as upstream remote (one time)
git remote add template <template-repo-url>

# Fetch latest changes
git fetch template

# Merge updates (resolve conflicts as needed)
git merge template/main

# Re-run setup if needed
npm run setup
```

## 🆘 Need Help?

If you encounter issues during setup:

1. **Check the logs**: `docker-compose logs`
2. **Verify prerequisites**: Re-run the prerequisite checks
3. **Try clean restart**: `npm run clean && npm run setup`
4. **Check troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
5. **Ask for help**: Include system info and error logs

## 📚 What's Next?

After successful setup, explore these guides:

### **Master Development**
- **🤖 [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** - Learn the 3-tier agentic framework
- **📋 [CLAUDE.md](./CLAUDE.md)** - Claude Code integration and daily commands

### **Quick Start**
- **🚀 [QUICK-START.md](./QUICK-START.md)** - Get up and running in 5 minutes

### **Technical Details**
- **⚙️ [INSTALL-GUIDE.md](./INSTALL-GUIDE.md)** - Deep dive into the smart installer
- **🆘 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions for common issues
- **📖 [README.md](./README.md)** - Complete project overview

---

**Ready to start building amazing features? Let the 3-tier Claude Code framework guide your development! 🚀**