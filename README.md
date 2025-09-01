# Next.js + Supabase Full-Stack Template

## 🤖 **Advanced 3-Tier Claude Code Framework**

A production-ready template for building full-stack web applications with Next.js frontend and Python FastAPI backend, powered by Supabase. **Optimized for Claude Code with an intelligent 3-tier agentic framework.**

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#your-repo-url)

## 🚀 **Quick Start - 5 Minutes to Running App**

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs-firebase-ai-coding-template

# 🪄 One command does everything:
npm run setup
```

**That's it!** The intelligent installer automatically:
- ✅ Detects available ports (no conflicts!)
- ✅ Configures all services  
- ✅ Starts your development environment
- ✅ Verifies everything is working

➡️ **Complete quick start guide**: [QUICK-START.md](./QUICK-START.md)

## 🤖 **3-Tier Claude Code Framework**

This template includes a sophisticated 3-tier agentic framework that makes development faster and smarter:

```
Tier 1: Main Orchestrator (You start here)
├── Tier 2: Front Agent (Frontend coordination)
│   └── Tier 3: Frontend Specialists (UI, State, Auth, Forms, Testing)
└── Tier 2: Back Agent (Backend coordination)  
    └── Tier 3: Backend Specialists (API, Database, Testing, DevOps)
```

### **How to Use the Framework**

Just describe what you want to build - the framework handles the rest:

```bash
# Simple request - automatically delegated
"Create a user profile page with avatar upload and form validation"

# Complex feature - coordinated across domains  
"Build a real-time chat system with message history, user presence, 
file sharing, and push notifications"
```

**The framework automatically:**
- 🎯 Routes to the right specialists
- 🏗️ Coordinates frontend and backend  
- ✅ Implements comprehensive testing
- 🔍 Reviews code quality

➡️ **Complete framework guide**: [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)

## 🏗️ **What You Get**

### **Frontend Stack**
- 🔐 **Next.js 14** with App Router
- 🎨 **Material-UI (MUI)** components  
- 🔄 **Supabase Auth** with social providers
- 📊 **Real-time subscriptions**
- 📝 **TypeScript** with full type safety
- ✅ **React Hook Form** with validation

### **Backend Stack**  
- ⚡ **FastAPI** with async support
- 🏗️ **Broker architecture** for organized APIs
- 📊 **Supabase** with PostgreSQL + real-time
- 🔒 **Row Level Security (RLS)** policies
- 🧪 **Comprehensive testing** with pytest
- 🐳 **Docker** development environment

### **Development Experience**
- 🤖 **3-Tier Claude Framework** for intelligent development
- 🔍 **Smart installer** with automatic port detection  
- ⚡ **Hot reload** for both frontend and backend
- 📦 **One-command setup** and daily development
- 🎯 **Test-driven development** workflows
- 📝 **Auto-generated API documentation**

## 📚 **Documentation**

### **Get Started**
- 🚀 **[QUICK-START.md](./QUICK-START.md)** - Get running in 5 minutes
- 🛠️ **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Comprehensive setup options  
- 🆘 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### **Development Guides**  
- 🤖 **[FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** - Master the 3-tier framework
- 📋 **[CLAUDE.md](./CLAUDE.md)** - Claude Code integration guide
- ⚙️ **[INSTALL-GUIDE.md](./INSTALL-GUIDE.md)** - Technical implementation details

## 🎯 **Choose Your Path**

### **👶 New to Development?**
Start with **[QUICK-START.md](./QUICK-START.md)** - we'll guide you through everything step-by-step.

### **⚡ Want to Code Immediately?**  
```bash
npm run setup && cd front && npm run dev
```
Then read **[FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** to master the 3-tier system.

### **🔧 Need Custom Setup?**
See **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** for alternative installation methods (cloud, manual, simplified Docker).

### **🆘 Having Issues?**
Check **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for solutions to common problems.

## 📁 **Project Structure**

```
nextjs-supabase-template/
├── 📚 docs/                          # Documentation
│   ├── QUICK-START.md                 # 5-minute setup
│   ├── FRAMEWORK-GUIDE.md             # 3-tier framework  
│   └── SETUP-GUIDE.md                 # Complete setup guide
│
├── 🤖 .claude/                        # 3-Tier Framework
│   ├── agents/                        # Specialist agents
│   └── rules/                         # Framework workflows
│
├── 🌐 front/                          # Next.js Frontend  
│   ├── src/app/                       # App Router pages
│   ├── src/auth/                      # Authentication
│   └── src/lib/                       # Supabase integration
│
├── ⚡ back/                           # FastAPI Backend
│   ├── src/brokers/api/               # API endpoints
│   ├── src/documents/                 # Database models
│   └── tests/                         # Comprehensive tests
│
├── 🛠️ Install Scripts                 # Smart setup system
│   ├── install.js                     # Cross-platform installer  
│   ├── install.sh                     # Linux/Mac optimized
│   └── install.bat                    # Windows with PowerShell
│
└── 🐳 docker-compose.yml              # Full development stack
```

## 📋 **Daily Commands**

```bash
# Development
npm run dev        # Start everything
npm run setup      # Re-run smart installer

# Service Management  
npm run start      # Start services
npm run stop       # Stop services
npm run status     # Check status
npm run logs       # View logs
npm run clean      # Clean restart

# Frontend (from /front directory)
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting

# Backend Testing (from /back directory)
pytest            # Run all tests
pytest --cov=src  # With coverage
```

## 🚀 **Example: Building Your First Feature**

With the 3-tier framework, building features is as simple as describing them:

```bash
# Ask Claude Code:
"Create a todo list where users can add, edit, delete, and share tasks 
with real-time updates and proper authentication"

# The framework automatically:
# 1. 🗄️ Creates database tables with RLS policies
# 2. ⚡ Builds FastAPI endpoints with validation  
# 3. 🎨 Creates Material-UI components with forms
# 4. 🔄 Adds real-time Supabase subscriptions
# 5. ✅ Implements comprehensive testing
# 6. 🔍 Reviews code for security and quality
```

## 🌟 **Why This Template?**

✅ **Intelligent Development**: 3-tier framework provides expert guidance  
✅ **Zero Configuration**: Smart installer handles everything automatically  
✅ **Production Ready**: Enterprise patterns and security best practices  
✅ **Beginner Friendly**: Step-by-step guides for all experience levels  
✅ **Advanced Scaling**: Framework grows with your application complexity  
✅ **Quality Assurance**: Built-in testing and code review at every level  

## 🔧 **System Requirements**

- **Node.js 18+** 
- **Docker & Docker Compose**
- **Git**
- **Python 3.11+** (for local development)

**Don't have these?** No problem! See **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** for installation instructions or use our **cloud development** options.

## 🆘 **Need Help?**

1. **Quick Issues**: Try `npm run setup` to auto-fix common problems
2. **Setup Problems**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. **Framework Questions**: See [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)  
4. **Detailed Setup**: See [SETUP-GUIDE.md](./SETUP-GUIDE.md)

## 📄 **License**

MIT - Build amazing things!

---

## 🎉 **Ready to Build?**

**Start with the 5-minute setup**: [QUICK-START.md](./QUICK-START.md)

**Master the framework**: [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)

**Build your first feature** - just describe what you want and let Claude Code's 3-tier framework guide you through the implementation!

---

Built with ❤️ using Next.js, Supabase, FastAPI, and advanced Claude Code agentic framework.