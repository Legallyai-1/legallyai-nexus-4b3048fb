# Editing Your App

## Option 1: GitHub Codespaces (No Install)

1. Go to your repo on GitHub
2. Click "Code" → "Codespaces" → "Create codespace"
3. VS Code opens in browser
4. Edit files
5. Commit & push
6. Auto-deploys!

## Option 2: Cursor AI (Recommended)

1. Download Cursor: https://cursor.sh
2. Clone repo: `git clone https://github.com/Legallyai-1/legallyai-nexus-4b3048fb.git`
3. Open folder in Cursor
4. Press Cmd+K (Mac) or Ctrl+K (Windows)
5. Tell Cursor what to change in plain English
6. It writes the code for you!

Example prompts:
- "Add a contact form to the homepage"
- "Change the color scheme to blue"
- "Add a new pricing tier"

## Option 3: VS Code + Copilot

1. Install VS Code
2. Install GitHub Copilot extension
3. Clone repo
4. Edit files with AI assistance

## Option 4: Direct GitHub Editing

1. Navigate to file on GitHub
2. Click pencil icon (Edit)
3. Make changes
4. Commit directly

## File Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── lib/            # Utilities
├── integrations/   # Supabase integration
└── styles/         # CSS files

supabase/
├── functions/      # Edge functions
└── migrations/     # Database migrations
```

## Common Edits

### Change Colors
Edit `src/index.css` and `tailwind.config.ts`

### Add Page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`

### Edit Text
Search for text in files and replace

### Add Feature
Tell Cursor/Copilot what you want

## Preview Changes

```bash
npm run dev
# Open http://localhost:8080
```

## Deploy Changes

```bash
git add .
git commit -m "Updated feature X"
git push
# Auto-deploys to Vercel!
```
