# 🤖 3-Tier Claude Code Framework Guide

**Master the advanced agentic framework that makes development faster, smarter, and more consistent.**

This guide covers everything about working with the sophisticated 3-tier framework specifically designed for Claude Code development.

## 🏗️ Framework Architecture

### **How the 3-Tier System Works**

```
Tier 1: Main Orchestrator (Strategic Analysis)
├── Tier 2: Front Agent (Frontend Domain)
│   └── Tier 3: Frontend Specialists
│       ├── ui-component-agent
│       ├── state-management-agent
│       ├── frontend-auth-agent
│       ├── form-handling-agent
│       ├── routing-agent
│       └── frontend-test-agent
└── Tier 2: Back Agent (Backend Domain)
    └── Tier 3: Backend Specialists
        ├── api-dev-agent
        ├── database-agent
        ├── backend-test-agent
        ├── devops-agent
        └── deployment-agent
    
Cross-Domain Specialists:
└── code-reviewer (Quality assurance across all tiers)
```

### **Framework Philosophy**

The 3-tier framework is built around **natural language requests**. You don't need to understand the internal agent structure - just describe what you want to build, and Claude Code automatically routes your request through the appropriate experts.

**Key Principles:**
- 🎯 **Strategic Coordination**: Complex features are properly planned and coordinated
- 🔧 **Expert Implementation**: Each technical area has dedicated specialists  
- 🏗️ **Architecture Consistency**: Domain agents ensure patterns are followed
- ✅ **Quality Assurance**: Built-in testing and code review at every tier
- 📈 **Scalable Development**: Easy to add features without architectural debt

## 🚀 Getting Started

### **🎯 Your Entry Point: Main Orchestrator**

**You always start at the Main Orchestrator (Tier 1).** This is your single entry point for all development requests.

```bash
# You simply describe what you want:
"Create a user profile system with avatar upload and privacy settings"

# The framework automatically handles the routing:
Main Orchestrator → Analyzes request → Routes to appropriate specialists
```

### **How Requests Get Routed**

#### **Simple Frontend Request**
```bash
"Create a responsive navigation menu with user authentication"

→ Main Orchestrator 
  → Front Agent 
    → ui-component-agent (responsive menu)
    → frontend-auth-agent (user authentication)
    → routing-agent (navigation logic)
```

#### **Simple Backend Request**
```bash
"Build a search API with pagination and filtering"

→ Main Orchestrator 
  → Back Agent 
    → database-agent (optimize queries)
    → api-dev-agent (build endpoints)
    → backend-test-agent (test functionality)
```

#### **Complex Full-Stack Feature**
```bash
"Create a real-time notification system with in-app alerts, email preferences, and push notifications"

→ Main Orchestrator (coordinates full-stack)
  ├── Back Agent → api-dev-agent + database-agent + backend-test-agent
  └── Front Agent → ui-component-agent + state-management-agent + frontend-test-agent
  └── code-reviewer (cross-domain quality assurance)
```

## 📝 Best Practices for Framework Usage

### **✅ DO: Let Claude Code Route Automatically**

```bash
# Perfect - describe the feature, not the implementation
"I want to build a file sharing system where users can upload files, 
organize them in folders, set sharing permissions, and get download links"

# The framework automatically:
# 1. Main Orchestrator analyzes the full-stack requirement
# 2. Coordinates backend work (file storage, permissions, API endpoints)
# 3. Coordinates frontend work (upload UI, folder management, sharing interface)
# 4. Ensures proper testing and code review across all components
```

### **✅ DO: Be Specific About Requirements**

```bash
# Good - specific and clear
"Create a user dashboard that shows analytics data with real-time updates"

# Better - includes technical details
"Build a Material-UI dashboard component with user analytics, 
real-time Supabase subscriptions, loading states, error handling, 
and mobile-responsive design"

# Best - includes quality requirements
"Create a comprehensive user dashboard with analytics visualization, 
real-time updates, proper loading states, error handling, accessibility 
features, comprehensive testing, and performance optimization"
```

### **✅ DO: Request Full-Stack Coordination**

```bash
"I want to build a user bookmarking system where users can bookmark articles, 
organize them into categories, share collections with others, and get 
real-time notifications when shared collections are updated."

# Framework coordination:
# 1. Main Orchestrator plans the full architecture
# 2. Back Agent creates database schema, API endpoints, real-time triggers
# 3. Front Agent builds UI components, state management, notification system
# 4. Cross-domain testing and code review ensures quality
```

### **✅ DO: Include Non-Functional Requirements**

```bash
"Create a payment processing system with Stripe integration, proper error 
handling, security validation, audit logging, webhook processing, retry 
logic, and comprehensive test coverage including edge cases"

# Framework ensures:
# - Security best practices (backend security specialists)
# - Proper error handling (across all tiers)  
# - Comprehensive testing (test specialists in both domains)
# - Code review for security and quality
```

### **❌ DON'T: Try to Invoke Sub-Agents Directly**

```bash
# Wrong - don't specify agents manually
"Use the api-dev-agent to create a REST endpoint for user management"

# Right - describe the business requirement
"Create user management functionality with CRUD operations and proper validation"
```

## 🎨 Domain-Specific Development

### **Frontend Domain (Front Agent)**

The Front Agent automatically coordinates these specialists:

#### **UI Component Agent**
- Material-UI implementation and theming
- Responsive design and mobile optimization
- Accessibility compliance
- Component composition and reusability

#### **State Management Agent**  
- React hooks and context management
- Real-time Supabase subscriptions
- Data caching and synchronization
- Performance optimization

#### **Frontend Auth Agent**
- User authentication flows
- Protected routes and role-based access
- Session management and token handling
- Authentication state persistence

#### **Form Handling Agent**
- Form validation with Yup schemas
- React Hook Form integration
- Error handling and user feedback
- Multi-step form workflows

#### **Routing Agent**
- Next.js App Router implementation
- Dynamic routing and parameters
- Route protection and middleware
- Navigation and page transitions

#### **Frontend Test Agent**
- Component testing with React Testing Library
- User interaction testing
- Integration testing with APIs
- Accessibility testing

**Frontend Examples:**
```bash
"Create a multi-step user onboarding flow with form validation, 
progress tracking, and integration with user profile creation"

"Build a responsive data visualization dashboard with interactive 
charts, real-time updates, and export functionality"

"Add dark/light theme toggle with user preference persistence 
and smooth transitions between themes"
```

### **Backend Domain (Back Agent)**

The Back Agent automatically coordinates these specialists:

#### **API Dev Agent**
- FastAPI endpoint development
- Request/response validation with Pydantic
- Business logic implementation
- API documentation generation

#### **Database Agent**
- PostgreSQL schema design and optimization
- Supabase Row Level Security (RLS) policies  
- Query optimization and indexing
- Data migration strategies

#### **Backend Test Agent**
- Integration testing with pytest
- API endpoint testing
- Database operation testing
- Test data management and cleanup

#### **DevOps Agent**
- Docker containerization and orchestration
- Local development environment setup
- Service configuration and monitoring
- Environment variable management

#### **Deployment Agent**
- Production deployment strategies
- CI/CD pipeline configuration
- Environment promotion and rollback
- Performance monitoring setup

**Backend Examples:**
```bash
"Create a robust user analytics system that tracks user actions, 
aggregates data efficiently, and provides reporting APIs with proper 
indexing and query optimization"

"Build a file processing pipeline that handles uploads, validates files, 
processes them asynchronously, and provides progress tracking"

"Implement a comprehensive search system with full-text indexing, 
relevance scoring, filtering capabilities, and pagination"
```

## 🔄 Development Workflows

### **Feature Development Workflow**

#### **1. Feature Planning Phase**
```bash
"I want to add a collaborative document editing feature to my app. 
Plan the architecture and provide implementation strategy."

# Framework provides:
# - Architecture analysis and recommendations
# - Technology stack suggestions  
# - Implementation roadmap
# - Risk assessment and mitigation strategies
```

#### **2. Implementation Phase**
```bash
"Implement the collaborative document editing system we planned, 
with real-time synchronization, conflict resolution, user presence 
indicators, and comprehensive testing."

# Framework coordinates:
# - Backend: WebSocket handling, document versioning, conflict resolution
# - Frontend: Real-time editor, user presence, conflict UI
# - Testing: Real-time functionality, concurrent editing, edge cases
# - Review: Security, performance, code quality
```

#### **3. Enhancement Phase**
```bash
"Add document sharing permissions, comment system, and revision history 
to the collaborative editor."

# Framework maintains consistency:
# - Extends existing architecture patterns
# - Integrates with current permission systems
# - Maintains test coverage and quality standards
```

### **Testing-First Development**

```bash
"I want to build a payment system. Start with comprehensive tests for all 
scenarios including successful payments, failed payments, refunds, webhooks, 
and security edge cases. Then implement the actual payment logic."

# Framework automatically:
# 1. Backend test agent: Creates comprehensive test suite
# 2. API dev agent: Implements endpoints to pass tests
# 3. Frontend test agent: Tests payment UI flows
# 4. Integration testing across the full payment workflow
# 5. Code reviewer: Security and quality validation
```

### **Performance Optimization Workflow**

```bash
"My user dashboard is loading slowly. Analyze performance bottlenecks 
and optimize the database queries, implement caching, improve frontend 
loading experience, and add monitoring."

# Framework coordinates optimization:
# 1. Database agent: Query analysis and optimization
# 2. API dev agent: Response caching and API optimization  
# 3. State management agent: Data loading optimization
# 4. UI component agent: Loading states and perceived performance
# 5. DevOps agent: Monitoring and performance metrics
# 6. Code reviewer: Performance best practices validation
```

## 🧪 Advanced Framework Features

### **Iterative Development**

```bash
# Start with MVP
"Create a basic commenting system for articles"

# Enhance iteratively while maintaining architecture consistency
"Add comment threading and nested replies"
"Add comment reactions and voting system"  
"Add comment moderation and reporting"
"Add email notifications for new comments"
"Add real-time comment updates"

# Framework maintains:
# - Consistent data models and API patterns
# - Progressive enhancement without technical debt
# - Comprehensive test coverage for all features
# - Unified UI/UX patterns across enhancements
```

### **Cross-Domain Coordination**

```bash
"Build a multi-tenant SaaS application with organization management, 
user role hierarchies, feature flags per plan, usage analytics, 
and billing integration."

# Framework automatically coordinates:
# 1. Main Orchestrator: Plans multi-tenant architecture
# 2. Back Agent: Database multi-tenancy, billing APIs, analytics
# 3. Front Agent: Organization UI, role management, plan features
# 4. Code reviewer: Security review for multi-tenant isolation
# 5. Test agents: Multi-tenant testing scenarios
```

### **Security-First Development**

```bash
"Implement user authentication with OAuth providers, 2FA, session management, 
password policies, account recovery, security logging, and compliance 
with security best practices."

# Framework ensures:
# - Backend security: Proper auth flows, token management, audit logging
# - Frontend security: Secure storage, XSS prevention, CSRF protection
# - Testing: Security testing scenarios and penetration testing
# - Code review: Security vulnerability assessment
```

## 🔍 Troubleshooting with the Framework

### **Development Environment Issues**

```bash
"My Docker containers won't start and I'm getting database connection errors. 
Help me debug and fix the development environment."

# Framework diagnosis:
# - DevOps agent: Docker and service configuration analysis
# - Database agent: Connection and configuration troubleshooting
# - Systematic debugging approach with specific solutions
```

### **Performance Problems**

```bash
"My app is slow and users are experiencing timeouts. Identify bottlenecks 
and provide optimization solutions."

# Framework analysis:
# - Database agent: Query performance analysis  
# - API dev agent: Endpoint performance profiling
# - Frontend specialists: Bundle size and loading optimization
# - Coordinated optimization strategy across all layers
```

### **Bug Investigation**

```bash
"Users report data inconsistency issues in my application. Help investigate 
and fix the root cause."

# Framework investigation:
# - Backend test agent: Reproduces issues with test cases
# - Database agent: Analyzes data integrity and constraints
# - API dev agent: Reviews business logic and validation
# - Frontend test agent: Tests user interaction scenarios
# - Cross-domain analysis for systemic issues
```

## 📚 Framework Documentation

### **Individual Agent Documentation**

Each specialist agent has detailed documentation:

- **`.claude/agents/tier-1/main-orchestrator.md`** - Strategic coordination
- **`.claude/agents/tier-2/front-agent.md`** - Frontend domain orchestration  
- **`.claude/agents/tier-2/back-agent.md`** - Backend domain orchestration
- **`.claude/agents/tier-3/frontend/`** - Frontend specialist agents
- **`.claude/agents/tier-3/backend/`** - Backend specialist agents
- **`.claude/agents/tier-3/cross-domain/`** - Cross-domain specialists

### **Framework Rules and Workflows**

- **`.claude/rules/claude-code-workflow.mdc`** - Main framework rules
- **`.claude/rules/backend-workflow.mdc`** - Backend delegation rules  
- **`.claude/rules/workflow.mdc`** - Frontend delegation rules
- **`.claude/SUB-AGENTS.md`** - Complete framework documentation

## 🎯 Framework Benefits

### **For Beginners**
- 🤖 **No Agent Management**: Just describe what you want in natural language
- 🏗️ **Architecture Guidance**: Framework provides best practices automatically
- ✅ **Quality Assurance**: Built-in testing and code review
- 📚 **Learning**: Learn best practices through framework implementations

### **For Experienced Developers**  
- ⚡ **Faster Development**: Expert coordination reduces implementation time
- 🎯 **Consistent Architecture**: Framework enforces proven patterns
- 🔍 **Comprehensive Testing**: Automated test coverage across all layers
- 🚀 **Scalable Growth**: Framework scales with application complexity

### **For Teams**
- 🤝 **Consistent Standards**: All code follows framework patterns
- 📖 **Knowledge Sharing**: Framework captures and shares best practices
- 🔄 **Efficient Handoffs**: Standardized patterns make code maintainable
- 📈 **Productive Collaboration**: Clear separation of concerns and responsibilities

## 📚 Related Documentation

### **Getting Started**
- **🚀 [QUICK-START.md](./QUICK-START.md)** - 5-minute setup and immediate framework usage
- **🛠️ [SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Comprehensive installation and setup options

### **Development Resources**
- **📋 [CLAUDE.md](./CLAUDE.md)** - Claude Code integration and daily commands
- **⚙️ [INSTALL-GUIDE.md](./INSTALL-GUIDE.md)** - Technical implementation of the smart installer

### **Support & Reference**
- **🆘 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions for common issues and debugging
- **📖 [README.md](./README.md)** - Complete project overview and architecture

---

**Ready to build amazing features with intelligent coordination? Start describing your ideas and let the 3-tier framework guide your development! 🚀**