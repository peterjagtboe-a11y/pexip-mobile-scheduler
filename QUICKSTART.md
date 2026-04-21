# Quick Start - Pexip Mobile Scheduler

Get dynamic Pexip meetings working on mobile in **10 minutes**.

## 🚀 What You're Building

A mobile Outlook add-in that creates dynamic Pexip VMRs using the **same API** your desktop add-in uses.

**No backend server needed!** Just GitHub Pages.

## ⚡ 3-Step Setup

### 1️⃣ Create GitHub Repo (3 min)

1. Go to https://github.com/new
2. Repository name: `pexip-mobile-scheduler`
3. Public repository
4. Create repository

### 2️⃣ Upload Files (3 min)

Upload these files to the **root** of your repository:

**Required:**
- `manifest.xml`
- `function-file.html`
- `function-file.js`

**Icons:**
Copy your existing Pexip add-in icons to `assets/` folder:
- `icon-16.png`
- `icon-32.png`
- `icon-64.png` (if you have it)
- `icon-80.png`
- `icon-128.png` (if you have it)

### 3️⃣ Enable GitHub Pages (2 min)

1. Go to Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main`, folder: `/ (root)`
4. Click Save
5. Wait 1-2 minutes for deployment

### 4️⃣ Install in Outlook (2 min)

**Desktop:**
1. Open Outlook
2. Click "Get Add-ins" or "Store"
3. Click "My add-ins"
4. Click "Add a custom add-in" → "Add from URL"
5. Enter: `https://yourusername.github.io/pexip-mobile-scheduler/manifest.xml`
6. Click Install

**Mobile:**
- Add-in automatically syncs to mobile
- No additional installation needed

## ✅ Test It

**Mobile Test:**
1. Open Outlook mobile app
2. Create new meeting
3. Look for Pexip button
4. Tap it
5. Wait 3-5 seconds
6. ✅ Meeting details appear with VMR ID

**Desktop Test:**
1. Create new meeting
2. Click "Add Pexip Meeting" button
3. ✅ Meeting details appear immediately

## 📱 What Happens When You Tap the Button

1. Add-in requests Microsoft authentication token
2. Calls Pexip API: `https://pexip.vc/api/client/v2/msexchange_schedulers/2/meeting_details`
3. Gets back HTML with meeting details
4. Inserts into meeting body
5. Done!

## 🎯 URLs to Remember

| What | URL |
|------|-----|
| Manifest | `https://yourusername.github.io/pexip-mobile-scheduler/manifest.xml` |
| Function file | `https://yourusername.github.io/pexip-mobile-scheduler/function-file.html` |
| GitHub Pages | `https://yourusername.github.io/pexip-mobile-scheduler/` |

## 🐛 Quick Troubleshooting

**Button doesn't appear:**
- Wait 5 minutes after installation
- Restart Outlook
- Check that GitHub Pages is enabled

**Button does nothing:**
- Clear Outlook app cache
- Check browser console for errors
- Verify `function-file.js` is accessible

**No meeting details:**
- Check authentication (should be automatic)
- Verify Pexip API endpoint
- Look at console logs

## 💡 Key Differences from Desktop

| Feature | Desktop | Mobile |
|---------|---------|--------|
| UI | Taskpane with options | No UI |
| Trigger | Click button → UI opens | Tap button → Executes |
| Speed | Instant | 2-3 seconds |
| API | Same Pexip Scheduling API | Same Pexip Scheduling API |

## 🔐 Security

- Uses Microsoft SSO (already logged in)
- No passwords to manage
- Token-based authentication
- Same security as desktop add-in

## ✨ Advantages

✅ No backend server to maintain
✅ Uses Pexip's official API
✅ Same auth as desktop
✅ Free hosting (GitHub Pages)
✅ Simple deployment

## 📚 Next Steps

- ✅ Test on both iOS and Android
- ✅ Share with team
- ✅ Monitor for any issues
- ✅ Read full README.md for details

## 🎉 That's It!

You now have dynamic Pexip meetings working on mobile using the **exact same API** as your desktop add-in.

No backend, no admin credentials, just simple and clean!

---

**Need help?** Check the full README.md or browser console for error messages.
