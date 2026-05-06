#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting UI with PM2${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed.${NC}"
    echo -e "${YELLOW}Installing PM2 globally...${NC}"
    npm install -g pm2
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} PM2 installed successfully"
    else
        echo -e "${RED}❌ Failed to install PM2${NC}"
        exit 1
    fi
fi

# Check if .next build exists
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Production build not found. Run ./setup.sh first.${NC}"
    exit 1
fi

# Check if ecosystem.config.js exists
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ ecosystem.config.js not found${NC}"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start PM2 process
echo -e "${YELLOW}Starting PM2 process...${NC}\n"

pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ UI started successfully${NC}\n"

    # Show process list
    pm2 list

    echo -e "\n${BLUE}Running process:${NC}"
    echo -e "  • montecarlo-ui (Port 3000) - Next.js Production Server"

    echo -e "\n${BLUE}Access your app:${NC}"
    echo -e "  ${GREEN}http://localhost:3000${NC}"

    echo -e "\n${BLUE}Useful commands:${NC}"
    echo -e "  ${GREEN}pm2 logs montecarlo-ui${NC}  - View logs"
    echo -e "  ${GREEN}pm2 monit${NC}                     - Monitor process"
    echo -e "  ${GREEN}pm2 restart montecarlo-ui${NC} - Restart"
    echo -e "  ${GREEN}pm2 stop montecarlo-ui${NC}   - Stop"
else
    echo -e "${RED}❌ Failed to start PM2 process${NC}"
    exit 1
fi
