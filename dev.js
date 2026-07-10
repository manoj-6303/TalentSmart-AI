import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 HireSmart: Starting Backend and Frontend services concurrently...');

// Spawning Backend Server (Node.js Express)
const backendProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Spawning Frontend Client (Vite React)
const frontendProcess = spawn('npm.cmd', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Ensure children die when parent is killed
const killChildren = () => {
  console.log('\nStopping all services...');
  backendProcess.kill();
  frontendProcess.kill();
};

process.on('SIGINT', killChildren);
process.on('SIGTERM', killChildren);
process.on('exit', killChildren);
