#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function main() {
  console.log('Setting up database for past papers...');
  
  const labContentServicePath = path.join(__dirname, 'lab-content-service');
  const seedScriptPath = path.join(labContentServicePath, 'src', 'seed-past-papers.js');
  
  try {
    await new Promise((resolve, reject) => {
      const seedProcess = spawn('node', [seedScriptPath], {
        cwd: labContentServicePath,
        stdio: 'inherit',
      });
      
      seedProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Seed script exited with code ${code}`));
        }
      });
      
      seedProcess.on('error', (err) => {
        reject(err);
      });
    });
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
