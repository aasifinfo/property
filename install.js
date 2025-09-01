#!/usr/bin/env node

/**
 * Smart Install Script for Next.js + Supabase Template
 * Automatically detects available ports and configures the entire stack
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const net = require('net');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Configuration for services and their default ports
const SERVICE_CONFIG = {
    postgres: { defaultPort: 5432, name: 'PostgreSQL Database' },
    kong: { defaultPort: 8000, name: 'Supabase API Gateway' },
    api: { defaultPort: 8001, name: 'FastAPI Backend' },
    frontend: { defaultPort: 3000, name: 'Next.js Frontend' },
    email: { defaultPort: 9000, name: 'Email UI (Inbucket)' },
    auth: { defaultPort: 9999, name: 'Supabase Auth (Internal)' },
    rest: { defaultPort: 3000, name: 'PostgREST (Internal)' },
    realtime: { defaultPort: 4000, name: 'Supabase Realtime (Internal)' },
    storage: { defaultPort: 5000, name: 'Supabase Storage (Internal)' },
    imgproxy: { defaultPort: 5001, name: 'Image Proxy (Internal)' }
};

let detectedPorts = {};

/**
 * Print colored output
 */
function print(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

/**
 * Print a step header
 */
function printStep(step, message) {
    print(`\n${step}. ${colors.bright}${message}${colors.reset}`, 'cyan');
}

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true);
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(false);
        });
    });
}

/**
 * Find the next available port starting from a base port
 */
async function findAvailablePort(basePort, maxTries = 50) {
    for (let i = 0; i < maxTries; i++) {
        const port = basePort + i;
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`Could not find available port starting from ${basePort}`);
}

/**
 * Detect available ports for all services
 */
async function detectPorts() {
    printStep('🔍', 'Detecting available ports...');
    
    for (const [service, config] of Object.entries(SERVICE_CONFIG)) {
        try {
            const availablePort = await findAvailablePort(config.defaultPort);
            detectedPorts[service] = availablePort;
            
            if (availablePort === config.defaultPort) {
                print(`  ✅ ${config.name}: ${availablePort} (default)`, 'green');
            } else {
                print(`  🔄 ${config.name}: ${availablePort} (${config.defaultPort} was busy)`, 'yellow');
            }
        } catch (error) {
            print(`  ❌ ${config.name}: Could not find available port`, 'red');
            throw error;
        }
    }
}

/**
 * Check if required software is installed
 */
function checkPrerequisites() {
    return new Promise((resolve, reject) => {
        printStep('🔍', 'Checking prerequisites...');
        
        const checks = [
            { name: 'Node.js', command: 'node --version', required: '18' },
            { name: 'npm', command: 'npm --version' },
            { name: 'Docker', command: 'docker --version' },
            { name: 'Docker Compose', command: 'docker-compose --version' }
        ];
        
        let completed = 0;
        let failed = false;
        
        checks.forEach(check => {
            exec(check.command, (error, stdout) => {
                completed++;
                
                if (error) {
                    print(`  ❌ ${check.name}: Not found or not working`, 'red');
                    failed = true;
                } else {
                    const version = stdout.trim().split(' ').pop();
                    print(`  ✅ ${check.name}: ${version}`, 'green');
                    
                    if (check.required && check.name === 'Node.js') {
                        const majorVersion = parseInt(version.substring(1));
                        if (majorVersion < parseInt(check.required)) {
                            print(`    ⚠️  Warning: Node.js ${check.required}+ recommended`, 'yellow');
                        }
                    }
                }
                
                if (completed === checks.length) {
                    if (failed) {
                        print('\n❌ Some prerequisites are missing. Please install them first.', 'red');
                        print('See the README.md for installation instructions.', 'yellow');
                        reject(new Error('Prerequisites not met'));
                    } else {
                        print('  🎉 All prerequisites are installed!', 'green');
                        resolve();
                    }
                }
            });
        });
    });
}

/**
 * Replace placeholders in a template file
 */
function replaceTemplateVariables(content, variables) {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(placeholder, value);
    }
    return result;
}

/**
 * Generate Docker Compose file with detected ports
 */
async function generateDockerCompose() {
    printStep('📝', 'Generating Docker Compose configuration...');
    
    // Read the template file
    let template;
    try {
        template = fs.readFileSync(path.join(__dirname, 'docker-compose.template.yml'), 'utf8');
    } catch (error) {
        // If template doesn't exist, create a dynamic one based on current docker-compose.yml
        template = fs.readFileSync(path.join(__dirname, 'docker-compose.yml'), 'utf8');
    }
    
    // Replace port placeholders with detected ports
    const variables = {
        POSTGRES_PORT: detectedPorts.postgres,
        KONG_PORT: detectedPorts.kong,
        API_PORT: detectedPorts.api,
        EMAIL_PORT: detectedPorts.email,
        AUTH_PORT: detectedPorts.auth,
        REST_PORT: detectedPorts.rest,
        REALTIME_PORT: detectedPorts.realtime,
        STORAGE_PORT: detectedPorts.storage,
        IMGPROXY_PORT: detectedPorts.imgproxy
    };
    
    const dockerComposeContent = replaceTemplateVariables(template, variables);
    
    // Write the generated docker-compose.override.yml
    fs.writeFileSync(path.join(__dirname, 'docker-compose.override.yml'), dockerComposeContent);
    
    print('  ✅ Docker Compose configuration generated', 'green');
}

/**
 * Generate environment files with detected ports
 */
async function generateEnvironmentFiles() {
    printStep('⚙️', 'Generating environment configuration...');
    
    // Frontend environment variables
    const frontendEnv = `# Auto-generated environment variables
NEXT_PUBLIC_SUPABASE_URL=http://localhost:${detectedPorts.kong}
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_API_BASE_URL=http://localhost:${detectedPorts.api}

# Port configuration (for reference)
FRONTEND_PORT=${detectedPorts.frontend}
`;
    
    // Backend environment variables  
    const backendEnv = `# Auto-generated environment variables
SUPABASE_URL=http://localhost:${detectedPorts.kong}
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
ENV=development

# Port configuration (for reference)  
API_PORT=${detectedPorts.api}
DATABASE_PORT=${detectedPorts.postgres}
`;
    
    // Write environment files
    const frontDir = path.join(__dirname, 'front');
    const backDir = path.join(__dirname, 'back');
    
    // Ensure directories exist
    if (!fs.existsSync(frontDir)) {
        fs.mkdirSync(frontDir, { recursive: true });
    }
    if (!fs.existsSync(backDir)) {
        fs.mkdirSync(backDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(frontDir, '.env.local'), frontendEnv);
    fs.writeFileSync(path.join(backDir, '.env'), backendEnv);
    
    print('  ✅ Environment files generated', 'green');
}

/**
 * Start Docker services
 */
function startDockerServices() {
    return new Promise((resolve, reject) => {
        printStep('🐳', 'Starting Docker services...');
        print('  This may take a few minutes on first run (downloading images)...', 'yellow');
        
        const dockerProcess = spawn('docker-compose', ['up', '-d'], {
            stdio: 'pipe'
        });
        
        let output = '';
        dockerProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        dockerProcess.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        dockerProcess.on('close', (code) => {
            if (code === 0) {
                print('  ✅ Docker services started successfully', 'green');
                resolve();
            } else {
                print('  ❌ Failed to start Docker services', 'red');
                print('  Output:', 'yellow');
                print(output);
                reject(new Error('Docker services failed to start'));
            }
        });
        
        dockerProcess.on('error', (error) => {
            print(`  ❌ Docker error: ${error.message}`, 'red');
            reject(error);
        });
    });
}

/**
 * Install frontend dependencies
 */
function installFrontendDependencies() {
    return new Promise((resolve, reject) => {
        printStep('📦', 'Installing frontend dependencies...');
        
        const npmProcess = spawn('npm', ['install'], {
            cwd: path.join(__dirname, 'front'),
            stdio: 'pipe'
        });
        
        npmProcess.stdout.on('data', (data) => {
            // Show progress dots instead of full npm output
            process.stdout.write('.');
        });
        
        npmProcess.on('close', (code) => {
            console.log(); // New line after progress dots
            if (code === 0) {
                print('  ✅ Frontend dependencies installed', 'green');
                resolve();
            } else {
                print('  ❌ Failed to install frontend dependencies', 'red');
                reject(new Error('npm install failed'));
            }
        });
        
        npmProcess.on('error', (error) => {
            print(`  ❌ npm error: ${error.message}`, 'red');
            reject(error);
        });
    });
}

/**
 * Verify services are running
 */
async function verifyServices() {
    printStep('🔍', 'Verifying services are running...');
    
    const checks = [
        { 
            name: 'PostgreSQL', 
            port: detectedPorts.postgres,
            test: () => new Promise(resolve => {
                exec('docker-compose exec -T postgres pg_isready -U postgres', (error) => {
                    resolve(!error);
                });
            })
        },
        {
            name: 'Supabase API Gateway',
            port: detectedPorts.kong,
            test: () => testHttpEndpoint(`http://localhost:${detectedPorts.kong}/health`)
        }
    ];
    
    for (const check of checks) {
        try {
            const isHealthy = await check.test();
            if (isHealthy) {
                print(`  ✅ ${check.name}: Running on port ${check.port}`, 'green');
            } else {
                print(`  ⚠️  ${check.name}: Started but not responding yet`, 'yellow');
            }
        } catch (error) {
            print(`  ❌ ${check.name}: Not responding`, 'red');
        }
    }
}

/**
 * Test HTTP endpoint
 */
function testHttpEndpoint(url) {
    return new Promise((resolve) => {
        const http = require('http');
        const urlObj = new URL(url);
        
        const req = http.request({
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            timeout: 3000
        }, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => resolve(false));
        req.end();
    });
}

/**
 * Save port configuration for future reference
 */
function savePortConfiguration() {
    const config = {
        ports: detectedPorts,
        generatedAt: new Date().toISOString(),
        services: {
            frontend: `http://localhost:${detectedPorts.frontend}`,
            api: `http://localhost:${detectedPorts.api}`,
            database: `localhost:${detectedPorts.postgres}`,
            supabase: `http://localhost:${detectedPorts.kong}`,
            email: `http://localhost:${detectedPorts.email}`
        }
    };
    
    fs.writeFileSync(path.join(__dirname, '.dev-ports.json'), JSON.stringify(config, null, 2));
}

/**
 * Display success message with service URLs
 */
function displaySuccessMessage() {
    print('\n' + '='.repeat(60), 'green');
    print('🎉 Setup Complete! Your development environment is ready.', 'green');
    print('='.repeat(60), 'green');
    
    print('\nServices running on:', 'bright');
    print(`├── 🌐 Frontend:     http://localhost:${detectedPorts.frontend}`, 'cyan');
    print(`├── ⚡ API:          http://localhost:${detectedPorts.api}`, 'cyan');
    print(`├── 🗄️  Database:    localhost:${detectedPorts.postgres}`, 'cyan');
    print(`├── 🔐 Supabase:     http://localhost:${detectedPorts.kong}`, 'cyan');
    print(`└── 📧 Email UI:     http://localhost:${detectedPorts.email}`, 'cyan');
    
    print('\nNext steps:', 'bright');
    print('1. Start frontend: cd front && npm run dev', 'yellow');
    print('2. Open http://localhost:' + detectedPorts.frontend + ' in your browser', 'yellow');
    print('3. Start coding! The 3-tier Claude framework is ready.', 'yellow');
    
    print('\n💡 Tips:', 'bright');
    print('• Your port configuration is saved in .dev-ports.json', 'magenta');
    print('• Run "docker-compose down" to stop services', 'magenta');
    print('• Run "docker-compose up -d" to restart services', 'magenta');
    print('• Need help? Check the troubleshooting guide in README.md', 'magenta');
}

/**
 * Main installation process
 */
async function main() {
    try {
        print('🚀 Smart Setup for Next.js + Supabase Template', 'bright');
        print('This script will automatically configure your development environment\n');
        
        await checkPrerequisites();
        await detectPorts();
        await generateDockerCompose();
        await generateEnvironmentFiles();
        await startDockerServices();
        await installFrontendDependencies();
        
        // Give services a moment to fully start
        print('\n⏳ Waiting for services to fully initialize...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await verifyServices();
        savePortConfiguration();
        displaySuccessMessage();
        
    } catch (error) {
        print(`\n❌ Setup failed: ${error.message}`, 'red');
        print('\nTroubleshooting:', 'yellow');
        print('• Make sure Docker Desktop is running', 'yellow');
        print('• Check the README.md for manual setup instructions', 'yellow');
        print('• Try running: docker-compose down && docker system prune -f', 'yellow');
        process.exit(1);
    }
}

// Run the installer
if (require.main === module) {
    main();
}

module.exports = {
    detectPorts,
    isPortAvailable,
    findAvailablePort
};