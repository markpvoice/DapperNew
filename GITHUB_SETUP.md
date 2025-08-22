# GitHub Repository Setup Instructions

Follow these steps to upload your Dapper Squad Entertainment project to GitHub.

## Prerequisites

- GitHub account
- Git installed on your computer
- Terminal/Command prompt access

## Step 1: Create GitHub Repository

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Sign in to your account

2. **Create New Repository**
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `dapper-squad-entertainment`
   - Description: `Modern web application for Dapper Squad Entertainment - DJ, Karaoke, and Photography services`
   - Set to **Public** or **Private** (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

## Step 2: Initialize Local Git Repository

Open terminal/command prompt and navigate to your project folder:

```bash
# Navigate to project directory
cd "/Volumes/T7 Shield/DevData/dapper/dapper-squad-entertainment"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Dapper Squad Entertainment web application

- Next.js 14 with TypeScript and Tailwind CSS
- Comprehensive booking system with email automation
- Admin dashboard for business management
- Stripe payment integration
- Email templates with React Email and Resend
- Database schema with Prisma and PostgreSQL
- Production-ready with testing and deployment config

🎉 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Step 3: Connect to GitHub Repository

Replace `your-username` with your actual GitHub username:

```bash
# Add GitHub remote origin
git remote add origin https://github.com/your-username/dapper-squad-entertainment.git

# Verify remote was added
git remote -v

# Push to GitHub (first time)
git push -u origin main
```

If you get an error about `master` vs `main` branch:

```bash
# Rename branch to main if needed
git branch -M main

# Then push again
git push -u origin main
```

## Step 4: Verify Upload

1. **Check GitHub**
   - Go to your repository on GitHub
   - You should see all files uploaded
   - README.md should display the project documentation

2. **Verify Structure**
   Your repository should show:
   ```
   dapper-squad-entertainment/
   ├── src/
   ├── emails/
   ├── prisma/
   ├── tests/
   ├── public/
   ├── package.json
   ├── README.md
   ├── CLAUDE.md
   └── ... (other config files)
   ```

## Step 5: Set Up Repository Settings

### Enable Issues and Discussions
1. Go to repository **Settings**
2. Scroll to **Features** section
3. Enable **Issues** for bug tracking
4. Enable **Discussions** for community

### Add Repository Topics
1. Click the gear ⚙️ icon next to "About"
2. Add topics: `nextjs`, `typescript`, `dj-services`, `booking-system`, `email-automation`, `stripe-payments`
3. Add website URL (when deployed)

### Set Up Branch Protection (Optional)
1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable "Require pull request reviews before merging"

## Step 6: Create Development Workflow

### Create .github/workflows directory
```bash
# Create GitHub Actions directory
mkdir -p .github/workflows

# Add to git
git add .
git commit -m "Add GitHub Actions workflow directory"
git push
```

### Future Git Workflow
```bash
# Daily workflow for updates
git add .
git commit -m "Describe your changes here"
git push

# For features
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
# Create Pull Request on GitHub
```

## Environment Variables Setup

**IMPORTANT**: Never commit your `.env.local` file with real API keys!

1. **Local Development**
   ```bash
   # Copy example file
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

2. **Production Environment Variables**
   - In your hosting service (Vercel, Netlify, etc.)
   - Add all environment variables from `.env.example`
   - Use production URLs and API keys

## Collaboration Setup

### Add Collaborators
1. Go to **Settings** → **Collaborators and teams**
2. Click "Add people"
3. Enter GitHub usernames or email addresses

### Set Up Issues Templates
Create `.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.
```

## Troubleshooting

### Authentication Issues
If you get authentication errors:

```bash
# Use personal access token instead of password
# Go to GitHub Settings → Developer settings → Personal access tokens
# Generate new token with repo permissions
# Use token as password when prompted
```

### Large Files
If you have large files (>100MB):

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "*.pdf"

# Add .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

### Push Rejected
If push is rejected:

```bash
# Pull latest changes first
git pull origin main

# Resolve any conflicts
# Then push again
git push
```

## Next Steps After Upload

1. **Set up CI/CD** with GitHub Actions
2. **Deploy to Vercel** or your hosting service
3. **Set up monitoring** with Sentry
4. **Configure database** on Railway or Supabase
5. **Set up email service** with Resend
6. **Configure Stripe** for payments

## Repository Maintenance

### Regular Updates
```bash
# Weekly maintenance
git pull origin main
npm update
npm audit fix
git add .
git commit -m "Update dependencies and security fixes"
git push
```

### Release Management
```bash
# Create releases for major updates
git tag -a v1.0.0 -m "Initial production release"
git push origin v1.0.0
```

---

**Your repository is now ready for development and deployment!** 🎉

The complete project structure has been created with:
- ✅ Modern Next.js 14 setup
- ✅ TypeScript configuration
- ✅ Database schema with Prisma
- ✅ Email system with React Email
- ✅ Payment integration setup
- ✅ Testing framework
- ✅ Development tools and linting
- ✅ Production deployment configuration

**Repository URL**: `https://github.com/your-username/dapper-squad-entertainment`