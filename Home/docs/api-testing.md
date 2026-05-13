# 🧪 Before/After Gallery System - Testing Guide

## Prerequisites
- Backend running: `cd backend && npm run dev`
- Web running: `cd web && npm run dev`
- Mobile app open (optional): `cd frontend && npm start`

---

## 🔍 Test 1: API Endpoints

### Test 1.1: Get All Gallery Items
```bash
# Should return empty array initially (no items created yet)
curl http://localhost:5000/api/gallery

# Expected Response:
{
  "success": true,
  "data": [],
  "count": 0
}
```

### Test 1.2: Create Gallery Item
```bash
# First, prepare a test image or use a URL
# File: test-before.jpg

curl -X POST http://localhost:5000/api/gallery \
  -H "X-Admin-Password: admin" \
  -F "image=@test-before.jpg" \
  -F "title=Living Room Transformation" \
  -F "order=0"

# Expected Response:
{
  "success": true,
  "message": "Gallery item created successfully",
  "data": {
    "id": "uuid",
    "title": "Living Room Transformation",
    "beforeImageUrl": "cloudinary-url",
    "isActive": true,
    "variants": []
  }
}
```

### Test 1.3: Get Gallery Items (With Data)
```bash
curl http://localhost:5000/api/gallery

# Expected Response should show the item you just created
```

### Test 1.4: Create Gallery Variant
```bash
# Replace {GALLERY_ID} with the id from previous response
# File: test-after.jpg

curl -X POST http://localhost:5000/api/gallery/{GALLERY_ID}/variants \
  -H "X-Admin-Password: admin" \
  -F "image=@test-after.jpg" \
  -F "styleName=Modern Minimalist" \
  -F "styleCategory=minimalism"

# Expected Response:
{
  "success": true,
  "message": "Gallery variant added successfully",
  "data": {
    "id": "variant-uuid",
    "styleName": "Modern Minimalist",
    "styleCategory": "minimalism",
    "afterImageUrl": "cloudinary-url",
    "order": 0
  }
}
```

### Test 1.5: Get Gallery Item with Variants
```bash
curl http://localhost:5000/api/gallery/{GALLERY_ID}

# Response should include the variant you just created
```

---

## 🌐 Test 2: Web Gallery Page

### Test 2.1: Open Gallery Page
```
Browser: http://localhost:5173/gallery
Expected: Page loads without errors
```

### Test 2.2: Verify Gallery Display
- [ ] Before image displays
- [ ] After image displays
- [ ] Labels show "Before" and "After"
- [ ] Style name shows on after image
- [ ] Navigation works (prev/next buttons)
- [ ] Page counter shows "1 of 1"

### Test 2.3: Test Style Selection
- [ ] Click on style variant thumbnail
- [ ] After image changes to selected style
- [ ] Thumbnail gets highlighted
- [ ] No console errors

---

## 📱 Test 3: Mobile Gallery

### Test 3.1: Open Mobile Gallery
```
Mobile App: Gallery tab
Expected: Gallery screen loads
```

### Test 3.2: Verify Mobile Display
- [ ] Before and after images display
- [ ] Images are properly sized
- [ ] Labels show correctly
- [ ] Style chips are scrollable
- [ ] Counter shows item position
- [ ] Navigation buttons work

### Test 3.3: Test Mobile Navigation
- [ ] Tap next button → goes to next item
- [ ] Tap previous button → goes to previous item
- [ ] Tap dot indicator → jumps to item
- [ ] Tap style chip → changes after image

---

## 🔐 Test 4: Admin Panel

### Test 4.1: Access Admin Gallery
```
Browser: http://localhost:5173/admin
Steps:
1. Click Gallery tab
2. Enter password: "admin"
3. Click Access
Expected: Gallery management panel loads
```

### Test 4.2: Create Gallery Item from UI
```
Steps:
1. Click "New Gallery Item" button
2. Enter title: "Test Living Room"
3. Upload a before image
4. Click Create
Expected: Item appears in list, no errors
```

### Test 4.3: Add Variant from UI
```
Steps:
1. Expand the gallery item (click on it)
2. Click "Add Style" button
3. Enter style name: "Luxury"
4. Select category: "luxury"
5. Upload an after image
6. Click "Add Variant"
Expected: Variant appears in thumbnails, no errors
```

### Test 4.4: Delete Variant
```
Steps:
1. Expand gallery item
2. Hover over variant thumbnail
3. Click trash icon
4. Confirm deletion
Expected: Variant is removed from list
```

### Test 4.5: Delete Gallery Item
```
Steps:
1. Click trash icon on item header
2. Confirm deletion
Expected: Item is removed from list, variants disappear too
```

---

## 🔄 Test 5: Data Sync

### Test 5.1: Create in Admin, View in Web
```
Steps:
1. Create gallery item in admin panel
2. Don't refresh web gallery page
3. Manually refresh the page
Expected: New item appears without any manual intervention
```

### Test 5.2: Update Image Sync
```
Steps:
1. In admin: Add new variant with image
2. In web: Refresh gallery page
3. In web: Select that style variant
Expected: New image appears immediately
```

### Test 5.3: Delete Sync
```
Steps:
1. In admin: Delete a variant
2. In web: Refresh gallery page
Expected: Deleted variant is gone
```

---

## ⚠️ Test 6: Error Handling

### Test 6.1: Missing Admin Password
```bash
curl -X POST http://localhost:5000/api/gallery \
  -F "image=@test.jpg" \
  -F "title=Test"

Expected: 403 Forbidden error
```

### Test 6.2: Wrong Admin Password
```bash
curl -X POST http://localhost:5000/api/gallery \
  -H "X-Admin-Password: wrong" \
  -F "image=@test.jpg" \
  -F "title=Test"

Expected: 403 Forbidden error
```

### Test 6.3: Invalid Gallery ID
```bash
curl http://localhost:5000/api/gallery/invalid-id

Expected: 404 Not Found error
```

### Test 6.4: Missing Required Field
```bash
curl -X POST http://localhost:5000/api/gallery/{GALLERY_ID}/variants \
  -H "X-Admin-Password: admin" \
  -F "image=@test.jpg"

Expected: 400 Bad Request (styleName required)
```

---

## 📊 Test 7: Database Queries

### Test 7.1: Verify Tables Exist
Open Prisma Studio:
```bash
cd backend
npx prisma studio
```

Expected: You should see:
- `gallery_items` table with data
- `gallery_variants` table with data

### Test 7.2: Verify Relationships
In Prisma Studio:
1. Click on a gallery_item
2. Look for `variants` section
3. Should show related gallery_variants

### Test 7.3: Cascade Delete
1. Delete a gallery_item from Prisma Studio
2. Check that all related gallery_variants are deleted
3. Refresh page to confirm

---

## 🖼️ Test 8: Image Storage

### Test 8.1: Verify Cloudinary Upload
1. Create a gallery item from admin
2. Open browser DevTools (F12)
3. Check Network tab
4. Look for Cloudinary upload request
5. Should see successful upload

### Test 8.2: Verify Image URLs
1. Create gallery item
2. Copy the `beforeImageUrl` from response
3. Paste in browser address bar
4. Image should display
5. Check URL contains: `cloudinary.com`

### Test 8.3: Verify Folder Organization
1. In Cloudinary dashboard
2. Navigate to Media Library
3. Check folders:
   - `/ai-interior/gallery/before/`
   - `/ai-interior/gallery/after/minimalism/`
   - etc.

---

## 📈 Test 9: Performance

### Test 9.1: Load Time
1. Go to `/gallery` page
2. Open DevTools → Performance tab
3. Refresh page
4. Check load time
5. Should be < 2 seconds

### Test 9.2: Image Load Time
1. Go to gallery page
2. DevTools → Network tab
3. Check image load times
4. Should be < 1 second each (Cloudinary optimized)

### Test 9.3: Smooth Animations
1. Go to gallery page
2. Click through items
3. Animations should be smooth
4. No jank or stutter

---

## 🔧 Test 10: Browser Dev Tools

### Test 10.1: Check for Console Errors
1. Open browser DevTools (F12)
2. Go to `/gallery` and `/admin`
3. Check Console tab
4. Should show no errors (only info/warnings ok)

### Test 10.2: Check Network Requests
1. DevTools → Network tab
2. Go to gallery page
3. Should see requests to `/api/gallery`
4. Status should be 200 OK
5. Should not see 404 or 500 errors

### Test 10.3: Check Responsive Design
1. DevTools → Device Toolbar (Ctrl+Shift+M)
2. Test gallery at different sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
3. Layout should adjust correctly

---

## ✅ Comprehensive Test Checklist

### Backend
- [ ] TypeScript compiles without errors
- [ ] Database migrations applied
- [ ] Prisma models created
- [ ] Gallery service works
- [ ] Controller handles requests
- [ ] Routes integrated
- [ ] API endpoints respond correctly
- [ ] Error handling works
- [ ] Cloudinary integration works

### Frontend Web
- [ ] Gallery page loads
- [ ] Items display with images
- [ ] Style variants display
- [ ] Navigation works
- [ ] Animations smooth
- [ ] Responsive design works
- [ ] No console errors

### Frontend Mobile
- [ ] Gallery screen loads
- [ ] Images display properly
- [ ] Navigation works
- [ ] Responsive design works
- [ ] Style selection works

### Admin Panel
- [ ] Gallery tab appears
- [ ] Password protection works
- [ ] Can create items
- [ ] Can add variants
- [ ] Can delete items
- [ ] Can delete variants
- [ ] Form validation works
- [ ] Images upload successfully

### Data Sync
- [ ] Admin changes appear in web
- [ ] Admin changes appear in mobile
- [ ] No manual refresh needed
- [ ] Delete operations sync
- [ ] Update operations sync

### Security
- [ ] Admin password required
- [ ] Wrong password rejected
- [ ] Public endpoints accessible
- [ ] Admin endpoints protected

### Performance
- [ ] Pages load quickly
- [ ] Images load quickly
- [ ] Animations smooth
- [ ] No memory leaks

---

## 🐛 Debugging Tips

### If Gallery Page Blank
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify backend is running
4. Verify `/api/gallery` returns data

### If Admin Panel Not Working
1. Check password is correct
2. Check backend server running
3. Check browser console
4. Verify Cloudinary credentials

### If Images Not Displaying
1. Check Cloudinary account active
2. Verify image URLs are correct
3. Check image file size < 10MB
4. Try downloading image directly

### If Variants Not Showing
1. Verify variants were created in API
2. Check Prisma Studio for data
3. Verify relationships in database
4. Try refreshing page

---

## 🎯 Test Report Template

```
Gallery System Test Report
========================
Date: [DATE]
Tester: [NAME]

Overall Status: ✅ PASS / ❌ FAIL

Backend Tests:
  - API Endpoints: ✅
  - Database: ✅
  - Image Upload: ✅
  - Error Handling: ✅

Web Frontend:
  - Gallery Display: ✅
  - Navigation: ✅
  - Responsiveness: ✅
  - Performance: ✅

Mobile Frontend:
  - Gallery Display: ✅
  - Navigation: ✅
  - Style Selection: ✅

Admin Panel:
  - Create Items: ✅
  - Add Variants: ✅
  - Delete Items: ✅
  - Image Upload: ✅

Data Sync:
  - Admin → Web: ✅
  - Admin → Mobile: ✅
  - Delete Sync: ✅

Issues Found:
  [List any issues here]

Recommendations:
  [List suggestions here]
```

---

## 🚀 You're Ready!

Once all tests pass, your gallery system is ready for production use. Share the `/gallery` link with customers, clients, and friends!

**Test everything, then celebrate!** 🎉
