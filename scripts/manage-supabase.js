#!/usr/bin/env node

/**
 * Manage Supabase via API
 * Usage: node scripts/manage-supabase.js [command] [args]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load tokens from .env.tokens
const envPath = path.join(__dirname, '..', '.env.tokens');
let SUPABASE_URL = process.env.SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  if (urlMatch) SUPABASE_URL = urlMatch[1].trim();
  if (keyMatch) SUPABASE_SERVICE_ROLE_KEY = keyMatch[1].trim();
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

async function runSQL(sql) {
  console.log('📝 Running SQL query...\n');
  console.log('SQL:', sql.substring(0, 100) + '...\n');

  try {
    const result = await supabaseRPC('rpc/exec_sql', { sql });
    console.log('✅ SQL executed successfully');
    return result;
  } catch (error) {
    // Try direct REST API instead
    console.log('⚠️  RPC method not available, trying alternative...');
    throw error;
  }
}

async function queryTable(table, filters = {}) {
  let url = `/rest/v1/${table}?select=*`;
  
  // Add filters
  Object.keys(filters).forEach((key, index) => {
    url += index === 0 ? '&' : '&';
    url += `${key}=eq.${filters[key]}`;
  });

  return supabaseAPI('GET', url);
}

async function insertData(table, data) {
  return supabaseAPI('POST', `/rest/v1/${table}`, data);
}

async function updateData(table, id, data) {
  return supabaseAPI('PATCH', `/rest/v1/${table}?id=eq.${id}`, data);
}

async function deleteData(table, id) {
  return supabaseAPI('DELETE', `/rest/v1/${table}?id=eq.${id}`);
}

function supabaseAPI(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: endpoint,
      method: method,
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = body ? JSON.parse(body) : {};
            resolve(parsed);
          } else {
            const parsed = body ? JSON.parse(body) : {};
            reject(new Error(`Supabase API Error: ${parsed.message || body}`));
          }
        } catch (e) {
          resolve(body); // Return raw if not JSON
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

function supabaseRPC(functionName, params = {}) {
  return supabaseAPI('POST', `/rest/v1/rpc/${functionName}`, params);
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'query':
      queryTable(args[0], {})
        .then(data => {
          console.log('✅ Query result:', JSON.stringify(data, null, 2));
        })
        .catch(console.error);
      break;
    
    case 'insert':
      const table = args[0];
      const data = JSON.parse(args[1] || '{}');
      insertData(table, data)
        .then(result => {
          console.log('✅ Inserted:', JSON.stringify(result, null, 2));
        })
        .catch(console.error);
      break;
    
    default:
      console.log('Usage:');
      console.log('  node scripts/manage-supabase.js query <table>');
      console.log('  node scripts/manage-supabase.js insert <table> <json_data>');
  }
}

module.exports = {
  runSQL,
  queryTable,
  insertData,
  updateData,
  deleteData,
  supabaseAPI,
};

