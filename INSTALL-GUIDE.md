# Smart Installation System - Technical Implementation

## Overview

The intelligent installation system automatically detects available ports and configures the development environment without requiring users to stop existing services. This guide covers the technical implementation details for contributors and advanced users.

> **For users**: See [QUICK-START.md](./QUICK-START.md) or [SETUP-GUIDE.md](./SETUP-GUIDE.md) instead.

## Architecture

### **Multi-Platform Approach**
The installer is implemented in three versions for maximum compatibility:

1. **`install.js`** - Node.js cross-platform (primary)
2. **`install.sh`** - Unix/Linux optimized with advanced features
3. **`install.bat`** - Windows batch with PowerShell integration

### **Core Install Scripts**

#### **install.js (Primary Implementation)**
- Cross-platform Node.js solution
- Uses `net` module for port detection
- JSON-based configuration generation
- Comprehensive error handling and logging
- Fallback port detection algorithms

#### **install.sh (Unix/Linux Optimized)**  
- Shell script with advanced Unix tools integration
- Multiple port detection methods (nc, netstat, lsof)
- Optimized for Docker environments
- Enhanced logging and debugging features

#### **install.bat (Windows Integration)**
- Batch script with PowerShell commands
- Windows-specific port detection (netstat, PowerShell)
- Docker Desktop integration
- WSL2 compatibility checks

### **Configuration Management**

#### **Template System**
```yaml
# docker-compose.template.yml
services:
  postgres:
    ports:
      - "{{POSTGRES_PORT}}:5432"
  kong:
    ports:
      - "{{KONG_PORT}}:8000"
```

#### **Generated Configuration**
```yaml
# docker-compose.override.yml (auto-generated)
services:
  postgres:
    ports:
      - "5432:5432"  # Or alternative if busy
  kong:
    ports:
      - "8100:8000"  # Alternative port detected
```

## Technical Implementation

### **1. Port Detection Algorithm**

#### **Node.js Implementation (install.js)**
```javascript
const net = require('net');

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function findAvailablePort(basePort) {
  for (let port = basePort; port < basePort + 50; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}
```

#### **Shell Script Implementation (install.sh)**
```bash
is_port_available() {
  local port=$1
  if command -v nc >/dev/null 2>&1; then
    ! nc -z localhost $port 2>/dev/null
  elif command -v netstat >/dev/null 2>&1; then
    ! netstat -tuln 2>/dev/null | grep -q ":$port "
  elif command -v lsof >/dev/null 2>&1; then
    ! lsof -i :$port >/dev/null 2>&1
  else
    # Fallback: assume available
    return 0
  fi
}

find_available_port() {
  local base_port=$1
  local max_tries=50
  local tries=0
  
  for ((port=base_port; port<base_port+max_tries; port++)); do
    if is_port_available $port; then
      echo $port
      return 0
    fi
    ((tries++))
  done
  
  echo "Error: Could not find available port starting from $base_port" >&2
  return 1
}
```

#### **Windows Batch Implementation (install.bat)**
```batch
:check_port
netstat -an | findstr ":%1 " >nul 2>&1
if !errorlevel! equ 0 (
    exit /b 1
) else (
    exit /b 0
)

:find_available_port
set base_port=%1
set /a port=%base_port%
set /a max_tries=50
set /a tries=0

:port_loop
if !tries! geq !max_tries! (
    echo ❌ Could not find available port starting from %base_port%
    exit /b 1
)

call :check_port !port!
if !errorlevel! equ 0 (
    set %2=!port!
    exit /b 0
)

set /a port=!port!+1
set /a tries=!tries!+1
goto port_loop
```

### **2. Configuration Generation**

#### **Template Processing**
The system uses placeholder replacement for dynamic configuration:

```javascript
// Node.js template processing
function generateDockerCompose(ports) {
  let template = fs.readFileSync('docker-compose.template.yml', 'utf8');
  
  // Replace all port placeholders
  template = template.replace(/{{POSTGRES_PORT}}/g, ports.postgres);
  template = template.replace(/{{KONG_PORT}}/g, ports.kong);
  template = template.replace(/{{API_PORT}}/g, ports.api);
  template = template.replace(/{{FRONTEND_PORT}}/g, ports.frontend);
  template = template.replace(/{{EMAIL_PORT}}/g, ports.email);
  
  fs.writeFileSync('docker-compose.override.yml', template);
}
```

#### **Environment File Generation**
Automatically generates environment files with detected ports:

```javascript
// Frontend environment (.env.local)
function generateFrontendEnv(ports) {
  const envContent = `# Auto-generated environment variables
NEXT_PUBLIC_SUPABASE_URL=http://localhost:${ports.kong}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_API_BASE_URL=http://localhost:${ports.api}

# Port configuration (for reference)
FRONTEND_PORT=${ports.frontend}
`;
  
  fs.writeFileSync('front/.env.local', envContent);
}

// Backend environment (.env)
function generateBackendEnv(ports) {
  const envContent = `# Auto-generated environment variables
SUPABASE_URL=http://localhost:${ports.kong}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV=development

# Port configuration (for reference)
API_PORT=${ports.api}
DATABASE_PORT=${ports.postgres}
`;
  
  fs.writeFileSync('back/.env', envContent);
}
```

### **3. Service Coordination**

#### **Port Mapping Strategy**
The system maintains service relationships while allowing port flexibility:

```javascript
const DEFAULT_PORTS = {
  postgres: 5432,    // Database server
  kong: 8000,        // Supabase API Gateway  
  api: 8001,         // Custom FastAPI backend
  frontend: 3000,    // Next.js development server
  email: 9000,       // Inbucket email UI
  auth: 9999,        // Supabase Auth service (internal)
  rest: 3000,        // PostgREST API (internal)
  realtime: 4000,    // Supabase Realtime (internal)
  storage: 5000,     // Supabase Storage (internal)
  imgproxy: 5001     // Image proxy service (internal)
};

async function detectAllPorts() {
  const detectedPorts = {};
  
  for (const [service, defaultPort] of Object.entries(DEFAULT_PORTS)) {
    const availablePort = await findAvailablePort(defaultPort);
    detectedPorts[service] = availablePort;
    
    if (availablePort !== defaultPort) {
      console.log(`🔄 ${service}: ${availablePort} (${defaultPort} was busy)`);
    } else {
      console.log(`✅ ${service}: ${availablePort} (default)`);
    }
  }
  
  return detectedPorts;
}
```

### **4. Cross-Platform Compatibility**
```bash
# One command setup
npm run setup

# What happens:
🔍 Check prerequisites ✅
🔍 Detect available ports ✅
📝 Generate configuration ✅
🐳 Start Docker services ✅
📦 Install dependencies ✅
✅ Verify everything works ✅
```

#### **Platform-Specific Implementations**

**Node.js (Cross-Platform)**
- Uses Node.js `net` module for universal compatibility
- JSON-based configuration management
- Consistent error handling across platforms
- Fallback mechanisms for different environments

**Unix/Linux Shell Script**
- Optimized for Unix tools (nc, netstat, lsof)
- Advanced Docker integration
- Enhanced logging with colored output
- Efficient system resource detection

**Windows Batch Script**
- PowerShell integration for advanced features
- Windows-specific port detection (netstat)
- Docker Desktop compatibility checks
- WSL2 environment detection and optimization

### **5. Error Handling and Recovery**

#### **Prerequisite Validation**
```javascript
async function checkPrerequisites() {
  const checks = [
    { name: 'Node.js', command: 'node --version', required: '>=18.0.0' },
    { name: 'npm', command: 'npm --version', required: '>=8.0.0' },
    { name: 'Docker', command: 'docker --version', required: true },
    { name: 'Docker Compose', command: 'docker-compose --version', required: true }
  ];
  
  for (const check of checks) {
    try {
      const result = await execAsync(check.command);
      console.log(`✅ ${check.name}: ${result.stdout.trim()}`);
    } catch (error) {
      console.error(`❌ ${check.name}: Not found`);
      throw new Error(`Missing prerequisite: ${check.name}`);
    }
  }
}
```

#### **Service Health Verification**
```javascript
async function verifyServices(ports) {
  const healthChecks = [
    { name: 'PostgreSQL', test: () => testPostgresConnection(ports.postgres) },
    { name: 'Supabase API', test: () => testHttpEndpoint(`http://localhost:${ports.kong}/health`) },
    { name: 'Custom API', test: () => testHttpEndpoint(`http://localhost:${ports.api}/`) }
  ];
  
  for (const check of healthChecks) {
    try {
      await check.test();
      console.log(`✅ ${check.name}: Running`);
    } catch (error) {
      console.warn(`⚠️  ${check.name}: Started but not responding yet`);
    }
  }
}
```

## Service Port Mapping

| Service | Default | Purpose | Detection Priority |
|---------|---------|---------|-------------------|
| PostgreSQL | 5432 | Database server | High |
| Supabase Kong | 8000 | API Gateway | High |
| FastAPI | 8001 | Custom backend API | High |
| Next.js | 3000 | Frontend development | High |
| Inbucket | 9000 | Email testing UI | Medium |
| Auth Service | 9999 | Supabase authentication | Low (internal) |
| PostgREST | 3000 | Database REST API | Low (internal) |
| Realtime | 4000 | WebSocket subscriptions | Low (internal) |
| Storage | 5000 | File storage API | Low (internal) |
| Image Proxy | 5001 | Image optimization | Low (internal) |

## Generated Files

### **docker-compose.override.yml**
```yaml
services:
  postgres:
    ports:
      - "{{POSTGRES_PORT}}:5432"  # Auto-replaced
```

### **Environment Files**
```env
# front/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8100  # Auto-detected port
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# back/.env  
SUPABASE_URL=http://localhost:8100  # Matches frontend
```

### **Port Configuration**
```json
{
  "ports": {
    "postgres": 5432,
    "kong": 8100,
    "api": 8001,
    "frontend": 3001,
    "email": 9000
  },
  "services": {
    "frontend": "http://localhost:3001",
    "api": "http://localhost:8001",
    "supabase": "http://localhost:8100"
  }
}
```

## Benefits

### **For Beginners**
✅ **No port conflicts** - Works alongside existing services  
✅ **Zero configuration** - Everything detected and configured automatically  
✅ **Clear feedback** - Progress indicators and success confirmation  
✅ **One command setup** - `npm run setup` does everything  

### **For Advanced Users**
✅ **Respects existing services** - Never kills running processes  
✅ **Configurable** - All port choices saved and reusable  
✅ **Multiple setup methods** - Choose your preferred approach  
✅ **Docker Compose integration** - Standard override pattern  

### **For Teams** 
✅ **Consistent environments** - Same script works for everyone  
✅ **No manual coordination** - Each developer gets unique ports  
✅ **Documentation integration** - Port info saved in project  
✅ **CI/CD ready** - Scripts work in automated environments  

## Usage Examples

### **First-Time Setup**
```bash
git clone <repo-url>
cd nextjs-firebase-ai-coding-template
npm run setup  # Everything configured automatically
```

### **Daily Development** 
```bash
npm run dev     # Start everything
npm run stop    # Stop when done
npm run status  # Check what's running
```

### **Troubleshooting**
```bash
npm run clean   # Clean slate
npm run setup   # Reconfigure everything
npm run logs    # Debug issues
```

## Success Message
```
🎉 Setup Complete! Your development environment is ready.

Services running on:
├── 🌐 Frontend:     http://localhost:3001
├── ⚡ API:          http://localhost:8001  
├── 🗄️  Database:    localhost:5432
├── 🔐 Supabase:     http://localhost:8100
└── 📧 Email UI:     http://localhost:9000

💡 Your port configuration is saved in .dev-ports.json
```

## Advanced Configuration

### **Custom Port Ranges**
Modify the port detection algorithm for specific environments:

```javascript
// Custom port ranges for different services
const PORT_RANGES = {
  postgres: { start: 5432, end: 5450 },
  kong: { start: 8000, end: 8020 },
  api: { start: 8001, end: 8030 },
  frontend: { start: 3000, end: 3020 },
  email: { start: 9000, end: 9010 }
};

async function findAvailablePortInRange(serviceName) {
  const range = PORT_RANGES[serviceName];
  for (let port = range.start; port <= range.end; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports in range ${range.start}-${range.end} for ${serviceName}`);
}
```

### **CI/CD Integration**
The installer can be configured for automated environments:

```bash
# Environment variable overrides
export SKIP_DOCKER_START=true  # Don't start services in CI
export FORCE_PORTS="postgres=5432,kong=8000"  # Force specific ports
export QUIET_MODE=true  # Minimal output for logs

# Run installer in CI mode
npm run setup
```

## Testing and Validation

### **Unit Tests for Port Detection**
```javascript
// tests/port-detection.test.js
const { isPortAvailable, findAvailablePort } = require('../install.js');

describe('Port Detection', () => {
  test('should detect available port', async () => {
    const port = await findAvailablePort(30000); // Use high port for testing
    expect(port).toBeGreaterThanOrEqual(30000);
    expect(await isPortAvailable(port)).toBe(true);
  });
  
  test('should skip busy ports', async () => {
    // Test with known busy port (if any)
    const port = await findAvailablePort(80); // HTTP port likely busy
    expect(port).not.toBe(80);
  });
});
```

## Contributing Guidelines

- All port detection methods should have fallback mechanisms
- Configuration generation must be atomic (all or nothing)
- Error messages should provide actionable guidance
- Cross-platform compatibility is required for core features
- Performance impact should be minimal (< 10 seconds total runtime)

## 📚 Related Documentation

### **User Guides**
- **🚀 [QUICK-START.md](./QUICK-START.md)** - Get running in 5 minutes with the smart installer
- **🛠️ [SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Comprehensive setup options and methods

### **Development Resources**  
- **🤖 [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md)** - Master the 3-tier agentic framework
- **📋 [CLAUDE.md](./CLAUDE.md)** - Claude Code integration and daily commands

### **Support**
- **🆘 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions for common installation issues
- **📖 [README.md](./README.md)** - Complete project overview and architecture

---

This technical guide is designed for contributors and advanced users. **For quick setup, use [QUICK-START.md](./QUICK-START.md) instead.**