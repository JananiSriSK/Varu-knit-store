import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let redisProcess = null;
let mlProcess = null;

export const startRedis = () => {
  const redisPath = path.join(__dirname, '../../Redis/redis-server.exe');
  
  redisProcess = spawn(redisPath, [], {
    detached: true,
    stdio: 'ignore'
  });
  
  redisProcess.unref();
  console.log('Redis started');
};

export const startMLService = () => {
  const mlPath = path.join(__dirname, '../../ml_service');
  
  // Try different Python commands
  const pythonCommands = ['python', 'python3', 'py'];
  
  for (const pythonCmd of pythonCommands) {
    try {
      mlProcess = spawn(pythonCmd, ['app.py'], {
        cwd: mlPath,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });
      
      mlProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.log(`ML Service: ${output}`);
      });
      
      mlProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error && !error.includes('WARNING')) {
          console.log(`ML Service Error: ${error}`);
        }
      });
      
      mlProcess.on('error', (error) => {
        console.log(`Failed to start ML service with ${pythonCmd}`);
        mlProcess = null;
      });
      
      mlProcess.on('spawn', () => {
        console.log(` ML Service started with ${pythonCmd}`);
      });
      
      // If spawn succeeds, break the loop
      break;
    } catch (error) {
      console.log(`Failed to start ML service with ${pythonCmd}`);
      mlProcess = null;
    }
  }
  
  if (!mlProcess) {
    console.log(' ML Service auto-start failed - Please start manually:');
    console.log('   cd ml_service && python app.py');
    console.log('   OR double-click start-ml.bat');
  }
};

export const stopServices = () => {
  if (redisProcess) {
    try {
      redisProcess.kill('SIGTERM');
      console.log('Redis stopped');
    } catch (error) {
      console.log('Redis already stopped');
    }
  }
  if (mlProcess) {
    try {
      mlProcess.kill('SIGTERM');
      console.log('ML Service stopped');
    } catch (error) {
      console.log('ML Service already stopped');
    }
  }
};