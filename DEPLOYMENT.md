# Deployment Guide for Mindspace

## Vercel Deployment

This application is optimized and ready for deployment on Vercel.

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (free tier works)

### Quick Deploy

1. **Connect to Vercel:**
   - Push your code to GitHub/GitLab/Bitbucket
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

2. **Vercel will automatically:**
   - Detect Vite framework
   - Use the build command: `npm run build`
   - Set output directory to `dist`
   - Configure routing for SPA

3. **Environment Variables (if needed):**
   - Add any required environment variables in Vercel dashboard
   - Example: `VITE_API_URL`, `VITE_SUPABASE_URL`, etc.

### Manual Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel
npx vercel --prod
```

### Build Configuration

- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x (recommended)

### Performance Optimizations

✅ Code splitting enabled
✅ Lazy loading for images
✅ PWA support with service worker
✅ Optimized bundle sizes
✅ Caching headers configured
✅ Error boundaries implemented

### PWA Features

The app includes:
- Service Worker for offline support
- Web App Manifest
- Installable on mobile devices
- Caching strategies for assets

### Troubleshooting

**Build fails:**
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run typecheck`

**Routing issues:**
- Vercel automatically handles SPA routing via `vercel.json`
- All routes redirect to `index.html`

**PWA not working:**
- Ensure HTTPS is enabled (Vercel provides this automatically)
- Check browser console for service worker errors
- Verify manifest.json is accessible

### Post-Deployment Checklist

- [ ] Test all routes and navigation
- [ ] Verify PWA installation works
- [ ] Check mobile responsiveness
- [ ] Test dark/light theme switching
- [ ] Verify service worker caching
- [ ] Test offline functionality
- [ ] Check performance metrics (Lighthouse)
- [ ] Verify SEO meta tags
- [ ] Test accessibility features

### Performance Targets

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

### Support

For issues or questions, check:
- Vercel documentation: https://vercel.com/docs
- Vite documentation: https://vitejs.dev
- React documentation: https://react.dev

