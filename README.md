# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 🚀 Build & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Run development server (http://localhost:8080)
npm run dev

# Lint code
npm run lint
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Build for development environment
npm run build:dev
```

### Railway Sync Automation

This repository includes a GitHub Action and a Node script to fetch Railway deployment info and forward it to a Supabase Edge Function.

#### How to use
1. Add required secrets to your GitHub repository (see below)
2. Push to `feature/railway-sync` branch or manually trigger the workflow
3. The action will run and call the sync script

#### Required Repository Secrets

Add these secrets in GitHub: **Settings → Secrets and variables → Actions → New repository secret**

- `RAILWAY_API_TOKEN` — Railway API token with read access
- `RAILWAY_PROJECT_ID` — Your Railway project ID
- `RAILWAY_ENVIRONMENT_ID` — Your Railway environment ID  
- `SUPABASE_FUNCTION_URL` — Full URL of your Supabase Edge Function

**Using GitHub CLI:**
```bash
gh secret set RAILWAY_API_TOKEN --body "sk_live_XXXXXXXX"
gh secret set RAILWAY_PROJECT_ID --body "proj_XXXXXXXX"
gh secret set RAILWAY_ENVIRONMENT_ID --body "env_XXXXXXXX"
gh secret set SUPABASE_FUNCTION_URL --body "https://<project>.functions.supabase.co/railway-sync"
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
