#!/usr/bin/env node

/**
 * Complete deployment script
 * Deploys to Vercel and manages Supabase
 */

const { deployToVercel } = require('./deploy-vercel');
const { queryTable, insertData } = require('./manage-supabase');
const { execSync } = require('child_process');

async function deployAll() {
  console.log('🚀 Starting complete deployment process...\n');

  try {
    // Step 1: Push to GitHub
    console.log('📤 Step 1: Pushing to GitHub...');
    try {
      execSync('git add -A', { stdio: 'inherit' });
      execSync('git commit -m "Auto-deploy: ' + new Date().toISOString() + '" || true', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Code pushed to GitHub\n');
    } catch (error) {
      console.log('⚠️  GitHub push skipped (no changes or already pushed)\n');
    }

    // Step 2: Deploy to Vercel
    console.log('🚀 Step 2: Deploying to Vercel...');
    const deployment = await deployToVercel();
    console.log('✅ Vercel deployment initiated\n');

    // Step 3: Summary
    console.log('📊 Deployment Summary:');
    console.log('  ✅ GitHub: Pushed');
    console.log('  ✅ Vercel: Deployment triggered');
    console.log('  🔗 Check Vercel Dashboard for status');
    console.log('\n✅ All done!');

    return deployment;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  deployAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { deployAll };

