#!/bin/bash
set -e

REMOTE_HOST="raspberrypi.local"
REMOTE_USER="bb8" # Default to pi, but might be different. SSH config usually handles username if set in host, but user prompt implied just 'raspberrypi'.
# Assuming the user's SSH config handles the username or it is the same as local.
# Actually, the user command `ssh raspberrypi echo` worked, so the user and key are configured.

TARGET_DIR="~/solar-time-of-use"

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Building Backend..."
cd backend
npm install
npm run build
cd ..

echo "Creating remote directories..."
ssh $REMOTE_HOST "mkdir -p $TARGET_DIR/frontend $TARGET_DIR/backend"

echo "Transferring frontend assets..."
# Using rsync if available, else scp
if command -v rsync >/dev/null 2>&1; then
    rsync -avz --delete frontend/dist $REMOTE_HOST:$TARGET_DIR/frontend/
    rsync -avz --delete backend/dist $REMOTE_HOST:$TARGET_DIR/backend/
    rsync -avz backend/package.json $REMOTE_HOST:$TARGET_DIR/backend/
else
    echo "rsync not found, using scp..."
    scp -r frontend/dist $REMOTE_HOST:$TARGET_DIR/frontend/
    scp -r backend/dist $REMOTE_HOST:$TARGET_DIR/backend/
    scp backend/package.json $REMOTE_HOST:$TARGET_DIR/backend/
fi

echo "Setting up remote environment..."
ssh $REMOTE_HOST << 'EOF'
    # Check for Node.js
    if ! command -v node >/dev/null 2>&1; then
        echo "Node.js not found. Installing Node.js 20.x..."
        # Install prerequisites
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        
        # Install from NodeSource
        # cleanup old
        sudo rm -f /etc/apt/keyrings/nodesource.gpg
        sudo rm -f /etc/apt/sources.list.d/nodesource.list
        
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        
        sudo apt-get update
        sudo apt-get install -y nodejs
    else
        echo "Node.js is already installed."
    fi

    cd ~/solar-time-of-use/backend
    echo "Installing production dependencies..."
    npm install --omit=dev

    echo "Checking for PM2..."
    if ! command -v pm2 >/dev/null 2>&1; then
        echo "PM2 not found. Installing globally via npm..."
        # Try to install without sudo first, or with sudo if needed?
        # Often npm -g needs sudo.
        if command -v sudo >/dev/null 2>&1; then
             sudo npm install -g pm2
        else
             npm install -g pm2
        fi
    fi

    echo "Starting/Restarting application..."
    # Check if app exists in PM2
    if pm2 list | grep -q "solar-tou"; then
        pm2 reload solar-tou
    else
        # Start index.js from dist
        pm2 start dist/index.js --name "solar-tou"
    fi

    pm2 save
EOF

echo "Deployment Complete!"
echo "Visit http://$REMOTE_HOST:3000"
