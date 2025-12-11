# GitHub Pages Deployment Guide

This guide explains how to deploy and configure the CROZZ demo site on GitHub Pages.

## Quick Setup

The demo site is already configured for GitHub Pages deployment from the `/docs/demo` directory.

### Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main` (or your default branch)
   - Folder: `/docs`
4. Click **Save**
5. GitHub will automatically deploy your site

### Access Your Site

After deployment (usually takes 1-2 minutes), your site will be available at:
```
https://sjhallo07.github.io/Crozz-Coin/demo/
```

## File Structure

```
docs/demo/
├── .nojekyll              # Tells GitHub Pages not to use Jekyll
├── _config.yml            # GitHub Pages configuration
├── index.html             # Main landing page
├── features.html          # Features showcase page
├── community.html         # Community & resources page
├── README.md              # Documentation
├── DEPLOYMENT.md          # This file
└── assets/
    ├── css/
    │   └── demo-styles.css
    ├── js/
    │   └── demo-interactive.js
    └── images/
        └── logo-no-background.png
```

## Configuration Files

### .nojekyll
This empty file tells GitHub Pages to bypass Jekyll processing, ensuring all files are served correctly (including those starting with underscores).

### _config.yml
Contains GitHub Pages metadata:
```yaml
title: CROZZ ECOSYSTEM Demo
description: Interactive demonstration of CROZZ decentralized application on Sui Blockchain
baseurl: "/Crozz-Coin/demo"
url: "https://sjhallo07.github.io"
```

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `docs/demo/`:
   ```bash
   echo "demo.yourdomain.com" > docs/demo/CNAME
   ```

2. Configure DNS records with your domain provider:
   - Add a CNAME record pointing to `sjhallo07.github.io`

3. Enable HTTPS in repository settings

## Updating the Site

Any changes pushed to the configured branch will automatically trigger a new deployment:

```bash
# Make changes to files in docs/demo/
git add docs/demo/
git commit -m "Update demo site"
git push origin main
```

GitHub Actions will automatically rebuild and deploy your site.

## Testing Locally

Before pushing changes, test locally:

```bash
cd docs/demo

# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Visit http://localhost:8000
```

## Performance Optimization

The demo site is optimized for performance:

- ✅ No external dependencies
- ✅ Minified CSS (single file)
- ✅ Optimized JavaScript
- ✅ Compressed images
- ✅ Mobile-first responsive design
- ✅ Lazy loading for images
- ✅ Semantic HTML for SEO

## SEO Configuration

All pages include:
- Meta descriptions
- Open Graph tags
- Twitter Card tags
- Structured heading hierarchy
- Alt text for images
- Canonical URLs

## Browser Support

Tested and supported on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Site not loading
- Check GitHub Actions tab for deployment status
- Ensure GitHub Pages is enabled in settings
- Verify the correct branch and folder are selected

### 404 errors
- Check that file paths are relative (e.g., `./assets/css/demo-styles.css`)
- Ensure `.nojekyll` file exists
- Clear browser cache

### Styles not loading
- Verify CSS file path in HTML
- Check browser console for errors
- Test locally first

### Images not displaying
- Verify image paths are relative
- Check image file names (case-sensitive on Linux/GitHub)
- Ensure images are committed to repository

## Security

- All external links use `rel="noopener"` for security
- No sensitive data or API keys in code
- HTTPS enforced when using GitHub Pages
- No external CDN dependencies

## Monitoring

Check deployment status:
1. Go to repository **Actions** tab
2. Look for "pages build and deployment" workflows
3. Click on a workflow run to see details

## Support

For issues with:
- **Demo content**: Open an issue in this repository
- **GitHub Pages**: Check [GitHub Pages documentation](https://docs.github.com/pages)
- **Sui development**: Join [Sui Discord](https://discord.gg/sui)

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Custom Domain Setup](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions for Pages](https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
