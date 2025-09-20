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
  
  try {
    mlProcess = spawn('python', ['app.py'], {
      cwd: mlPath,
      detached: false,
      stdio: 'pipe'
    });
    
    mlProcess.stdout.on('data', (data) => {
      console.log(`ML Service: ${data.toString().trim()}`);
    });
    
    mlProcess.on('error', (error) => {
      console.log('ML Service auto-start failed - start manually');
    });
    
    console.log('ML Service started automatically');
  } catch (error) {
    console.log('ML Service auto-start failed - start manually');
  }
};

export const stopServices = () => {
  if (redisProcess) {
    redisProcess.kill();
    console.log('Redis stopped');
  }
  if (mlProcess) {
    mlProcess.kill();
    console.log('ML Service stopped');
  }
};