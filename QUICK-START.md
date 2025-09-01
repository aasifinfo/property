# 🚀 Quick Start Guide

**Get your Next.js + Supabase app running in 5 minutes!**

This guide will have you building features with the 3-tier Claude Code framework in no time.

## ⚡ One-Command Setup

Our intelligent installer automatically detects available ports and configures everything:

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs-firebase-ai-coding-template

# 🪄 One command does everything:
npm run setup
```

**That's it! 🎉** The installer will:
- ✅ Check prerequisites (Node.js, Docker, etc.)
- 🔍 Automatically detect available ports  
- ⚙️ Generate configuration files
- 🐳 Start all Docker services
- 📦 Install dependencies
- ✅ Verify everything is working

## 🎯 What You'll See

```
🚀 Smart Setup for Next.js + Supabase Template

🔍 1. Checking prerequisites...
  ✅ Node.js: v18.17.0
  ✅ npm: 9.6.7
  ✅ Docker: 24.0.6

🔍 2. Detecting available ports...
  ✅ PostgreSQL Database: 5432 (default)
  🔄 Supabase API Gateway: 8100 (8000 was busy)
  ✅ FastAPI Backend: 8001 (default)
  🔄 Next.js Frontend: 3001 (3000 was busy)

📝 3. Generating configuration files...
  ✅ All configuration generated

🐳 4. Starting services...
  ✅ All services started successfully

============================================================
🎉 Setup Complete! Your development environment is ready.
============================================================

Services running on:
├── 🌐 Frontend:     http://localhost:3001
├── ⚡ API:          http://localhost:8001
├── 🔐 Supabase:     http://localhost:8100
└── 📧 Email UI:     http://localhost:9000

Next steps:
1. Start frontend: cd front && npm run dev
2. Open http://localhost:3001 in your browser
3. Start coding with Claude Code!
```

## 🔥 Start Development

After setup, start your development environment:

```bash
# Start everything
npm run dev

# OR manually
docker-compose up -d && cd front && npm run dev
```

## 🤖 Using the 3-Tier Claude Code Framework

The magic begins! Just describe what you want to build:

```bash
# Example requests to Claude Code:
"Create a user profile page with avatar upload and form validation"
"Build a real-time chat system with message history"
"Add a user dashboard with analytics and charts"
"Create an authentication system with email verification"
```

Claude Code's 3-tier framework automatically:
- 🎯 **Routes your request** to the right specialists
- 🏗️ **Coordinates** frontend and backend development
- ✅ **Implements testing** across all layers
- 🔍 **Reviews code quality** automatically

## 📱 Your First Feature

Try this example:

```bash
# Ask Claude Code:
"Create a simple todo list where users can add, edit, and delete tasks with real-time updates"

# The framework will automatically:
# 1. Create database tables with proper RLS policies
# 2. Build FastAPI endpoints with validation
# 3. Create React components with Material-UI
# 4. Add real-time Supabase subscriptions
# 5. Include comprehensive tests
# 6. Review code quality
```

## 📋 Daily Commands

```bash
npm run dev        # Start development
npm run stop       # Stop all services
npm run status     # Check service status
npm run logs       # View logs
npm run clean      # Clean slate restart
```

## 📚 What's Next?

### **Learn the Framework**
- **🤖 [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** - Master the 3-tier agentic system
- **📋 [CLAUDE.md](./CLAUDE.md)** - Claude Code integration and daily commands

### **Explore Setup Options**
- **🛠️ [SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Alternative setup methods (cloud, manual, etc.)
- **⚙️ [INSTALL-GUIDE.md](./INSTALL-GUIDE.md)** - Technical implementation details

### **Get Help**
- **🆘 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common issues
- **📖 [README.md](./README.md)** - Complete project overview

---

**Ready to build? Let Claude Code guide you through creating amazing features! 🚀**