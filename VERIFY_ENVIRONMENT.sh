#!/bin/bash

# VERIFY_ENVIRONMENT.sh - Check all environment configurations
# Ensures all environments are properly configured

echo "🔍 ENVIRONMENT VERIFICATION"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to verify Supabase environment
check_supabase() {
    echo "1️⃣  Checking Supabase configuration..."
    
    # Check if config.toml exists
    if [[ ! -f "supabase/config.toml" ]]; then
        echo -e "${RED}❌ supabase/config.toml not found${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ supabase/config.toml exists${NC}"
    fi
    
    echo ""
}

# Function to verify Vercel environment
check_vercel() {
    echo "2️⃣  Checking Vercel configuration..."
    
    if [[ ! -f "vercel.json" ]]; then
        echo -e "${YELLOW}⚠️  vercel.json not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ vercel.json exists${NC}"
        
        # Check for proper VITE_ prefixes
        if grep -q "VITE_SUPABASE" vercel.json; then
            echo -e "${GREEN}✅ VITE_SUPABASE variables configured${NC}"
        else
            echo -e "${YELLOW}⚠️  VITE_SUPABASE variables not in vercel.json${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    echo ""
}

# Function to verify environment files
check_env_files() {
    echo "3️⃣  Checking environment files..."
    
    if [[ ! -f ".env.example" ]]; then
        echo -e "${YELLOW}⚠️  .env.example not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ .env.example exists${NC}"
        
        # Check for proper variables
        if grep -q "VITE_SUPABASE_URL" .env.example; then
            echo -e "${GREEN}✅ VITE_SUPABASE_URL in .env.example${NC}"
        else
            echo -e "${YELLOW}⚠️  VITE_SUPABASE_URL missing${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        if grep -q "VITE_SUPABASE_ANON_KEY" .env.example; then
            echo -e "${GREEN}✅ VITE_SUPABASE_ANON_KEY in .env.example${NC}"
        else
            echo -e "${YELLOW}⚠️  VITE_SUPABASE_ANON_KEY missing${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    # Check .gitignore
    if [[ -f ".gitignore" ]]; then
        if grep -q "^\.env$" .gitignore; then
            echo -e "${GREEN}✅ .env properly gitignored${NC}"
        else
            echo -e "${YELLOW}⚠️  .env might not be gitignored${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    echo ""
}

# Function to check deployment configs
check_deployment() {
    echo "4️⃣  Checking deployment configurations..."
    
    # Check for proper deployment platforms
    PLATFORMS=0
    
    if [[ -f "vercel.json" ]]; then
        echo -e "${GREEN}✅ Vercel deployment configured${NC}"
        PLATFORMS=$((PLATFORMS + 1))
    fi
    
    if [[ -f "netlify.toml" ]]; then
        echo -e "${GREEN}✅ Netlify deployment configured${NC}"
        PLATFORMS=$((PLATFORMS + 1))
    fi
    
    if [[ $PLATFORMS -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  No deployment platform configured${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    echo ""
}

# Run all checks
check_supabase
check_vercel
check_env_files
check_deployment

# Summary
echo "=========================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================="
echo ""

if [[ $ERRORS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Environment is properly configured:"
    echo "  ✅ Supabase configured"
    echo "  ✅ Vercel ready"
    echo "  ✅ Environment files correct"
    echo ""
    echo "🎉 Ready to deploy!"
    exit 0
elif [[ $ERRORS -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo ""
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Review warnings above but safe to proceed."
    exit 0
else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo ""
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Please fix errors above before deploying."
    exit 1
fi
