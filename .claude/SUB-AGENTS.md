# Claude Code 3-Tier Agentic Framework

This project implements a sophisticated 3-tier agentic framework specifically designed for Claude Code, providing hierarchical specialization and intelligent task delegation across full-stack development.

## Framework Architecture ✅

The project has been successfully migrated from a flat sub-agent structure to a proper 3-tier hierarchical framework:

### What This Achieves
- **Strategic Oversight**: Main Orchestrator provides high-level task analysis and coordination
- **Domain Expertise**: Tier 2 agents manage frontend and backend domains with specialized knowledge
- **Tactical Implementation**: Tier 3 agents provide deep specialization in specific technical areas
- **Intelligent Routing**: Tasks automatically flow to the most appropriate specialists
- **Coordinated Development**: Complex features are orchestrated across multiple agents

## 3-Tier Structure

```
Tier 1: Main Orchestrator (Strategic)
├── Tier 2: Front Agent (Frontend Domain)
│   ├── Tier 3: ui-component-agent
│   ├── Tier 3: state-management-agent  
│   ├── Tier 3: frontend-auth-agent
│   ├── Tier 3: form-handling-agent
│   ├── Tier 3: routing-agent
│   └── Tier 3: frontend-test-agent
├── Tier 2: Back Agent (Backend Domain)
│   ├── Tier 3: api-dev-agent
│   ├── Tier 3: database-agent
│   ├── Tier 3: backend-test-agent
│   ├── Tier 3: devops-agent
│   └── Tier 3: deployment-agent
└── Tier 3: code-reviewer (Cross-Domain)
```

## Agent Responsibilities

### Tier 1: Main Orchestrator 🎯
**Role**: Strategic task analysis and delegation  
**Location**: `.claude/agents/tier-1/main-orchestrator.md`  
**Responsibilities**:
- Analyze incoming user requests
- Determine domain scope (frontend/backend/cross-cutting)
- Delegate to appropriate Tier 2 domain agents
- Coordinate multi-domain tasks
- Track progress with TodoWrite

### Tier 2: Domain Orchestrators 🏗️

#### Front Agent (Frontend Domain)
**Location**: `.claude/agents/tier-2/front-agent.md`  
**Responsibilities**:
- Manage all frontend-related work
- Delegate to appropriate Tier 3 frontend specialists
- Coordinate UI/UX development across components
- Ensure frontend architecture consistency

#### Back Agent (Backend Domain)  
**Location**: `.claude/agents/tier-2/back-agent.md`  
**Responsibilities**:
- Manage all backend-related work
- Delegate to appropriate Tier 3 backend specialists
- Coordinate API, database, and infrastructure layers
- Ensure backend architecture consistency

### Tier 3: Specialists 🛠️

#### Frontend Specialists
**Location**: `.claude/agents/tier-3/frontend/`

- **ui-component-agent**: Material-UI components, responsive design, accessibility
- **state-management-agent**: React hooks, context, Supabase subscriptions
- **frontend-auth-agent**: Auth UI flows, protected routes, auth context
- **form-handling-agent**: Form validation, input components, submission handling
- **routing-agent**: Next.js navigation, page layouts, route protection
- **frontend-test-agent**: Component testing, E2E tests, UI interaction testing

#### Backend Specialists
**Location**: `.claude/agents/tier-3/backend/`

- **api-dev-agent**: FastAPI routes, business logic, Pydantic models
- **database-agent**: PostgreSQL schema, RLS policies, migrations
- **backend-test-agent**: Integration tests, API testing, test data management
- **devops-agent**: Docker environment, service orchestration, monitoring
- **deployment-agent**: Production deployments, CI/CD, environment promotion

#### Cross-Domain Specialists
**Location**: `.claude/agents/tier-3/cross-domain/`

- **code-reviewer**: Security, architecture compliance, performance reviews

## How It Works

### Automatic Task Routing

Claude Code intelligently routes tasks through the hierarchy:

```markdown
User Request: "Create a user dashboard with real-time notifications"

Main Orchestrator Analysis:
- Complex full-stack feature
- Requires backend (notifications API) + frontend (dashboard UI)
- Multi-agent coordination needed

Delegation Strategy:
1. → Back Agent: "Create notifications API and database schema"
   - Back Agent → database-agent: notification tables
   - Back Agent → api-dev-agent: notification endpoints
2. → Front Agent: "Build dashboard UI with real-time updates"  
   - Front Agent → ui-component-agent: dashboard layout
   - Front Agent → state-management-agent: real-time subscriptions
3. Coordination: Ensure API and UI work together seamlessly
```

### Single-Domain Tasks

```markdown
User Request: "Add form validation to the profile page"

Main Orchestrator Analysis: Frontend-only task
→ Delegate to Front Agent
→ Front Agent delegates to form-handling-agent
```

### Multi-Stage Features

```markdown
User Request: "Implement email notifications"

Main Orchestrator coordinates staged approach:
Stage 1: Back Agent → database-agent (notification tables)
Stage 2: Back Agent → api-dev-agent (email service endpoints)
Stage 3: Front Agent → ui-component-agent (notification preferences UI)
Stage 4: Front Agent → state-management-agent (real-time updates)
```

## Development Workflow

### 1. Task Analysis (Tier 1)
- Main Orchestrator receives and analyzes user requests
- Determines scope: frontend-only, backend-only, or full-stack
- Plans delegation strategy using TodoWrite
- Routes to appropriate Tier 2 domain agents

### 2. Domain Coordination (Tier 2) 
- Domain agents break down complex requests into specialized components
- Delegate specific tasks to appropriate Tier 3 specialists
- Coordinate work between multiple specialists
- Ensure architectural consistency within their domain

### 3. Specialized Implementation (Tier 3)
- Specialists handle focused, tactical implementation
- Deep expertise in specific technical areas
- Direct code implementation and testing
- Report completion back to Tier 2 coordinators

## File Structure

```
.claude/
├── agents/
│   ├── tier-1/
│   │   └── main-orchestrator.md
│   ├── tier-2/
│   │   ├── back-agent.md
│   │   └── front-agent.md
│   └── tier-3/
│       ├── backend/
│       │   ├── api-dev-agent.md
│       │   ├── database-agent.md
│       │   ├── backend-test-agent.md
│       │   ├── devops-agent.md
│       │   └── deployment-agent.md
│       ├── frontend/
│       │   ├── ui-component-agent.md
│       │   ├── state-management-agent.md
│       │   ├── frontend-auth-agent.md
│       │   ├── form-handling-agent.md
│       │   ├── routing-agent.md
│       │   └── frontend-test-agent.md
│       └── cross-domain/
│           └── code-reviewer.md
├── rules/
│   ├── claude-code-workflow.mdc    # Main 3-tier framework rules
│   ├── backend-workflow.mdc        # Backend domain rules
│   └── workflow.mdc               # Frontend domain rules
└── SUB-AGENTS.md                  # This documentation
```

## Benefits Achieved

### For Claude Code
✅ **Hierarchical Specialization**: Each tier has appropriate scope and responsibility  
✅ **Intelligent Delegation**: Automatic routing to the most suitable experts  
✅ **Coordinated Development**: Strategic oversight with tactical implementation  
✅ **Scalable Architecture**: Easy to add new specialists under existing domains  
✅ **Clear Separation of Concerns**: Strategic vs tactical responsibilities

### For Developers  
✅ **Expert Guidance**: Each technical area has dedicated specialized expertise  
✅ **Coordinated Features**: Complex full-stack features are properly orchestrated  
✅ **Architecture Consistency**: Domain agents ensure architectural compliance  
✅ **Efficient Development**: Tasks automatically route to appropriate specialists  
✅ **Quality Assurance**: Built-in code review and testing at every tier

## Usage Examples

### Simple Request
```
"Fix the loading state on the profile page"
→ Main Orchestrator → Front Agent → ui-component-agent
```

### Complex Feature
```  
"Add user analytics dashboard"
→ Main Orchestrator coordinates:
  ├── Back Agent manages database + API
  │   ├── database-agent: analytics tables
  │   └── api-dev-agent: analytics endpoints
  └── Front Agent manages UI + real-time updates
      ├── ui-component-agent: dashboard layout  
      └── state-management-agent: real-time data
```

### Quality Assurance
```
"Review my recent authentication changes"  
→ Main Orchestrator → code-reviewer (cross-domain specialist)
```

## Success Metrics

This 3-tier framework successfully transforms the project architecture:

✅ **15 Total Agents**: Properly organized across 3 hierarchical tiers  
✅ **Strategic Coordination**: Main Orchestrator provides high-level oversight  
✅ **Domain Expertise**: 2 domain agents manage frontend and backend respectively  
✅ **Specialized Implementation**: 12 specialists provide deep technical expertise  
✅ **Intelligent Routing**: Automatic task delegation based on domain and complexity  
✅ **Scalable Design**: Easy to add new specialists under existing domain structure

The project now provides enterprise-grade agentic architecture that combines strategic oversight with specialized implementation, ensuring both architectural coherence and technical excellence across the full-stack development lifecycle.