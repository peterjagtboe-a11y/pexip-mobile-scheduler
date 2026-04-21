# Pexip Mobile Scheduler - Using Pexip's Scheduling API

This add-in creates dynamic Pexip meetings on mobile using the **same API** as your working desktop add-in.

## 🎯 How It Works

```
Mobile Outlook → Your Add-in → Microsoft Auth → Pexip Scheduling API → VMR Created
```

**No backend server needed!** This calls Pexip's API directly, just like the desktop version.

## 🔑 Key Components

### API Details
- **Endpoint:** `https://pexip.vc/api/client/v2/msexchange_schedulers/2/meeting_details`
- **Authentication:** Microsoft Azure AD token with scope `PexipScheduling.Access`
- **Scheduler ID:** `2` (your company's scheduler)
- **Response:** HTML meeting instructions with embedded VMR details

### How It's Different from Desktop
- **Desktop:** Shows taskpane with Pexip's UI
- **Mobile:** Executes function directly (no UI)
- **Both:** Use the same Pexip Scheduling API

## 📋 Setup Instructions

### Step 1: Create GitHub Repository

1. Create new repo: `pexip-mobile-scheduler`
2. Upload these files to **root**:
   - `manifest.xml`
   - `function-file.html`
   - `function-file.js`
   - `assets/` folder with icons

3. Enable GitHub Pages:
   - Settings → Pages
   - Branch: main, folder: / (root)
   - Save

### Step 2: Add Icons

You can **reuse icons from your existing Pexip add-in** or create new ones.

Required files in `assets/` folder:
- `icon-16.png`
- `icon-32.png`
- `icon-64.png`
- `icon-80.png`
- `icon-128.png`

If you have the desktop add-in icons, just copy them!

### Step 3: Install Add-in

**Desktop:**
1. Open Outlook
2. Get Add-ins → My add-ins
3. Add from URL: `https://yourusername.github.io/pexip-mobile-scheduler/manifest.xml`

**Mobile:**
- Automatically syncs from desktop installation

### Step 4: Test

**Desktop:**
1. Create meeting
2. Click "Add Pexip Meeting" button
3. Meeting details appear automatically

**Mobile:**
1. Create meeting
2. Tap Pexip button
3. Wait 3-5 seconds
4. Meeting details appear

## 🔐 Authentication Flow

1. User taps button
2. Add-in requests Microsoft token with scope `PexipScheduling.Access`
3. Office.js handles authentication (user already logged in)
4. Token passed to Pexip API in `token` header
5. Pexip validates token and returns meeting details
6. Add-in inserts HTML into meeting body

## 📊 Response Format

```json
{
  "status": "success",
  "result": {
    "room_name": "Pexip VC One-Time Scheduling",
    "room_email": "pi79.vmrscheduling@pexip.com",
    "alias_id": "PXPS:-guid#",
    "instructions": "<HTML with meeting join details>"
  }
}
```

The HTML includes:
- VMR ID (e.g., `10000858`)
- Web link: `https://pexip.vc/10000858`
- SIP URI: `10000858@pexip.vc`
- Dial-in numbers (international)
- Pexip app deep link

## ✨ Advantages of This Approach

✅ **No backend server needed** - Direct API call to Pexip
✅ **Same API as desktop** - Proven, working solution
✅ **Microsoft handles auth** - Uses built-in Office.js SSO
✅ **No admin credentials** - Uses user-level authentication
✅ **Secure** - Token-based authentication
✅ **Simple** - Just GitHub Pages hosting

## 🆚 Comparison with Other Solutions

| Feature | This (Scheduling API) | Admin API Approach |
|---------|----------------------|-------------------|
| Backend Required | ❌ No | ✅ Yes (Railway/Vercel) |
| Admin Access | ❌ No | ✅ Yes |
| API Used | Pexip Scheduling API | Pexip Admin API |
| Authentication | Microsoft SSO | Admin credentials |
| Complexity | Low | Medium |
| Maintenance | GitHub Pages only | Backend + GitHub Pages |

## 🐛 Troubleshooting

### Button does nothing on mobile
- Check that `function-file.js` is accessible
- Verify GitHub Pages is enabled
- Clear Outlook app cache

### Authentication errors
- Ensure manifest has correct `WebApplicationInfo`
- Verify Azure app ID: `f94167dc-15d8-48a7-b8cb-25cd8bc9ab80`
- Check scope: `PexipScheduling.Access`

### API errors
- Verify scheduler ID is `2`
- Check Pexip API endpoint is accessible
- Look at browser console for error messages

### Meeting details not appearing
- Check browser console for errors
- Verify VMR ID extraction is working
- Ensure HTML is being inserted

## 📝 File Structure

```
pexip-mobile-scheduler/
├── manifest.xml           # Add-in manifest with SSO config
├── function-file.html     # HTML wrapper
├── function-file.js       # Main logic (MSAL + API call)
└── assets/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-64.png
    ├── icon-80.png
    └── icon-128.png
```

## 🔧 Customization

### Change button text
Edit `manifest.xml`:
```xml
<bt:String id="buttonLabel" DefaultValue="Your Custom Text"/>
```

### Modify meeting body format
The HTML comes from Pexip's API. If you need custom formatting, you can parse the `instructions` field and rebuild it.

### Add custom fields
You can extract additional data from the API response and add to the meeting:
```javascript
// In function-file.js
const vmrId = extractVmrId(meetingDetails.instructions);
const roomEmail = meetingDetails.room_email;
// Use these values as needed
```

## 📚 Technical Details

### Azure AD App Configuration
- **Client ID:** `f94167dc-15d8-48a7-b8cb-25cd8bc9ab80`
- **Resource:** `api://f94167dc-15d8-48a7-b8cb-25cd8bc9ab80`
- **Scope:** `PexipScheduling.Access`

This is Pexip's registered Azure AD application. Your organization must have consented to this app.

### Office.js SSO
Uses `Office.context.auth.getAccessTokenAsync()` which:
- Gets token without user interaction
- Uses Outlook's existing session
- No popup required
- Works on mobile

### Pexip API
- Endpoint pattern: `/api/client/v2/msexchange_schedulers/{id}/meeting_details`
- Authentication: JWT token in `token` header
- Returns: Meeting details with HTML instructions

## 🎉 Success Criteria

- [ ] Add-in appears in Outlook ribbon
- [ ] Mobile button appears in Outlook app
- [ ] Clicking button creates meeting
- [ ] Meeting details appear in body
- [ ] Location field is populated
- [ ] VMR is unique each time
- [ ] Can join meeting via web/SIP/phone

## 💡 Why This Works

Your desktop add-in already uses this API successfully. This mobile version:
1. Uses the **exact same API endpoint**
2. Uses the **exact same authentication**
3. Gets the **exact same response**
4. Just runs on mobile instead of desktop

The only difference is **no taskpane UI** - it executes directly.

## 🆘 Getting Help

If something doesn't work:

1. Check browser console for errors
2. Verify GitHub Pages URLs are accessible
3. Test the API endpoint manually:
   ```bash
   # Get a token from your working desktop add-in
   # Then test the API:
   curl -H "token: YOUR_TOKEN" \
     https://pexip.vc/api/client/v2/msexchange_schedulers/2/meeting_details
   ```

## 📄 License

MIT

---

**Note:** This is a completely separate add-in from Pexip's official desktop add-in. It can coexist with the desktop version - use whichever works best for each platform!
