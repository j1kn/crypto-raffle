#!/bin/bash
# Setup script for git authentication

echo "🔐 Setting up Git Authentication for Auto-Push"
echo ""

# Option 1: Store credentials
echo "Option 1: Store credentials (recommended for auto-push)"
echo "This will save your GitHub token/credentials"
read -p "Do you want to set up credential storage? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git config credential.helper store
    echo "✅ Credential helper configured"
    echo "   Next time you push, enter your credentials and they'll be saved"
fi

echo ""
echo "Option 2: Use Personal Access Token in remote URL"
echo "This embeds your token in the remote URL"
read -p "Do you want to set up token-based authentication? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub Personal Access Token: " TOKEN
    if [ ! -z "$TOKEN" ]; then
        git remote set-url origin https://${TOKEN}@github.com/j1kn/crypto-raffle.git
        echo "✅ Token configured in remote URL"
        echo "⚠️  Note: Token is stored in .git/config (local only)"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To test auto-push, run: npm run push"

