#!/usr/bin/env node

/**
 * Deploy to Vercel using API
 * Usage: node scripts/deploy-vercel.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load tokens from .env.tokens
const envPath = path.join(__dirname, '..', '.env.tokens');
let VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VERCEL_TOKEN=(.+)/);
  if (match) {
    VERCEL_TOKEN = match[1].trim();
  }
}

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN not found');
  console.error('Set VERCEL_TOKEN environment variable or add to .env.tokens');
  process.exit(1);
}

async function deployToVercel() {
  console.log('🚀 Deploying to Vercel...\n');

  try {
    // First, get project ID
    const projects = await vercelAPI('GET', '/v9/projects');
    const project = projects.projects?.find(p => p.name === 'crypto-raffle' || p.name.includes('crypto'));
    
    if (!project) {
      console.log('📦 Project not found. Creating new project...');
      // Create project
      const newProject = await vercelAPI('POST', '/v9/projects', {
        name: 'crypto-raffle',
        gitRepository: {
          type: 'github',
          repo: 'j1kn/crypto-raffle',
        },
      });
      console.log('✅ Project created:', newProject.name);
      return newProject;
    }

    console.log('✅ Found project:', project.name);
    console.log('📤 Triggering deployment...\n');

    // Trigger deployment
    const deployment = await vercelAPI('POST', `/v13/deployments`, {
      name: project.name,
      project: project.id,
      target: 'production',
    });

    console.log('✅ Deployment triggered!');
    console.log('🔗 URL:', deployment.url || `https://${project.name}.vercel.app`);
    console.log('📊 Status:', deployment.readyState || 'building');
    
    return deployment;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    throw error;
  }
}

function vercelAPI(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${parsed.error?.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run if called directly
if (require.main === module) {
  deployToVercel()
    .then(() => {
      console.log('\n✅ Deployment process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error.message);
      process.exit(1);
    });
}

module.exports = { deployToVercel, vercelAPI };

