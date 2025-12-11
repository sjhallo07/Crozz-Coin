# GitHub Pages Quick Setup Guide

Follow these simple steps to deploy the CROZZ demo site on GitHub Pages.

## 🚀 Quick Setup (2 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository: `https://github.com/sjhallo07/Crozz-Coin`
2. Click on **Settings** (top menu)
3. Scroll down and click **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: Select `main` (or the branch with this PR merged)
   - **Folder**: Select `/docs`
5. Click **Save**

### Step 2: Wait for Deployment

- GitHub will automatically build and deploy your site
- This usually takes 1-2 minutes
- You'll see a message: "Your site is ready to be published"
- Once complete, it will show: "Your site is live at..."

### Step 3: Access Your Site

Your demo site will be available at:
```
https://sjhallo07.github.io/Crozz-Coin/demo/
```

## 📝 Important Notes

### First Time Setup
- Make sure this PR is merged to the main branch first
- The `/docs` folder must exist in the selected branch
- GitHub Actions needs to be enabled (usually is by default)

### Deployment Time
- First deployment: 2-5 minutes
- Subsequent updates: 1-2 minutes
- Check the "Actions" tab to monitor deployment progress

### Custom Domain (Optional)
If you want to use a custom domain like `demo.crozz.com`:

1. Add a `CNAME` file to `/docs/demo/`:
   ```
   demo.crozz.com
   ```

2. Configure DNS with your domain provider:
   - Add a CNAME record pointing to: `sjhallo07.github.io`
   - Wait for DNS propagation (5-60 minutes)

3. In GitHub Pages settings:
   - Enter your custom domain
   - Enable "Enforce HTTPS" (recommended)

## ✅ Verification Checklist

After enabling GitHub Pages, verify:

- [ ] Navigate to Settings → Pages
- [ ] See "Your site is live" message
- [ ] Click the provided URL
- [ ] Site loads correctly
- [ ] All pages accessible (index, features, community)
- [ ] Images display properly
- [ ] Navigation works
- [ ] Mobile view works (resize browser or use mobile device)

## 🔧 Troubleshooting

### Site Not Loading (404 Error)
- **Solution**: Make sure `/docs` folder is selected, not `/docs/demo`
- Access the site at: `https://sjhallo07.github.io/Crozz-Coin/demo/`
- Note: The base URL is `/Crozz-Coin/demo/`, not `/demo/`

### Styles Not Loading
- **Solution**: Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors
- Verify all files are committed and pushed

### 404 on Sub-pages
- **Solution**: Ensure `.nojekyll` file exists in `/docs/demo/`
- This file tells GitHub not to use Jekyll processing
- Should already be included in this PR

### Deployment Failed
- **Solution**: Check the "Actions" tab for error messages
- Ensure the branch is up to date
- Re-trigger deployment by making a small change and pushing

### Old Version Showing
- **Solution**: Clear browser cache
- Wait a few minutes for CDN to update
- Try incognito/private browsing mode

## 📊 Monitoring Deployment

### Check Deployment Status

1. Go to **Actions** tab
2. Look for "pages build and deployment" workflow
3. Click on the latest run to see details
4. Green checkmark = successful deployment
5. Red X = failed deployment (check logs)

### View Deployment URL

In Settings → Pages, you'll see:
```
Your site is live at https://sjhallo07.github.io/Crozz-Coin/demo/
```

Click to visit your deployed site!

## 🔄 Updating the Site

After initial setup, any changes to `/docs/demo/` will automatically deploy:

```bash
# Make changes to files
git add docs/demo/
git commit -m "Update demo site"
git push origin main

# GitHub automatically deploys changes
# Wait 1-2 minutes and refresh your browser
```

## 🌐 Accessing Pages

Once deployed, access pages at:

- **Home**: `https://sjhallo07.github.io/Crozz-Coin/demo/`
- **Features**: `https://sjhallo07.github.io/Crozz-Coin/demo/features.html`
- **Community**: `https://sjhallo07.github.io/Crozz-Coin/demo/community.html`

## 📱 Testing

### Desktop Testing
1. Open site in different browsers (Chrome, Firefox, Safari)
2. Test navigation and interactive elements
3. Verify all links work

### Mobile Testing
1. Open site on mobile device
2. Test hamburger menu
3. Verify responsive layout
4. Check touch interactions

### Performance Testing
1. Use Chrome DevTools → Lighthouse
2. Run audit on Performance, SEO, Accessibility
3. Should score 90+ in all categories

## 🎉 Success!

Once you see "Your site is live", you're done! 

Share your demo site:
- Direct link: `https://sjhallo07.github.io/Crozz-Coin/demo/`
- QR code generator: Use any QR code generator with the URL
- Social media: Share with Open Graph tags already configured

## 📞 Need Help?

- **GitHub Pages Docs**: https://docs.github.com/pages
- **Repository Issues**: https://github.com/sjhallo07/Crozz-Coin/issues
- **Deployment Guide**: See `DEPLOYMENT.md` in the same directory

---

**That's it!** Your CROZZ ECOSYSTEM demo site is now live and accessible to everyone! 🚀
