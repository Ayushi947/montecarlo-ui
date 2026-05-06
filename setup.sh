#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Monte Carlo UI (Next.js) Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Node.js is installed
echo -e "${YELLOW}[1/3]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} npm $NPM_VERSION found"

# Install dependencies
echo -e "\n${YELLOW}[2/3]${NC} Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Dependencies installed successfully"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# Build the application
echo -e "\n${YELLOW}[3/3]${NC} Building Next.js application..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build completed successfully"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nTo start development server:"
echo -e "  ${BLUE}npm run dev${NC}"
echo -e "\nTo start production server:"
echo -e "  ${BLUE}npm start${NC}"
echo -e "\nProduction build available in:"
echo -e "  ${BLUE}.next/${NC}\n"
