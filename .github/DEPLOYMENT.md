# Deployment Guide

## Overview

This project uses a **CI-first deployment workflow** where GitHub Actions validates code quality before manual deployment to Vercel.

## Workflow

```
Push to GitHub → CI Runs → CI Passes → Manual Deploy to Vercel
```

## GitHub Actions CI

**Triggers:** Push to `main`/`master` or Pull Requests

**Steps:**
1. Install dependencies (`yarn install --frozen-lockfile`)
2. Run linter (`yarn lint`)
3. Run tests (`yarn test`)
4. Build + Type check (`yarn build`)

**File:** `.github/workflows/ci.yml`

## Vercel Deployment

### Configuration

Vercel's automatic GitHub deployments are **disabled** to prevent deploying code that hasn't passed CI.

**Settings in `vercel.json`:**
```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

### How to Deploy

#### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

#### Option 2: Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click "Deployments" tab
3. Click "Create Deployment"
4. Select branch and deploy

### Deployment Checklist

Before deploying:
- [ ] CI workflow passed on GitHub
- [ ] All tests passing locally
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Changes tested in development

## Why This Approach?

1. **Quality Gates**: CI must pass before deployment
2. **TypeScript Consistency**: Vercel's TS version may differ from local
3. **Control**: Deploy when ready, not automatically
4. **Cost Efficiency**: Avoid unnecessary preview deployments
5. **Debugging**: Easier to identify issues when deployment is intentional

## Troubleshooting

### CI Fails

1. Check GitHub Actions logs
2. Run the same commands locally:
   ```bash
   yarn lint
   yarn test
   yarn build
   ```
3. Fix issues and push again

### Vercel Build Fails

1. Ensure CI passed first
2. Check Vercel build logs
3. Verify `vercel.json` configuration
4. Test build locally: `yarn build`

### TypeScript Errors on Vercel

If you see TypeScript errors on Vercel that don't appear locally:
1. Check TypeScript version in `package.json`
2. Ensure `yarn.lock` is committed
3. Verify all type imports are explicit
4. Run `yarn build` locally to catch issues early
