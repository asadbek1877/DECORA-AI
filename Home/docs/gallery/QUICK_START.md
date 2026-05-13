# ⚡ Gallery System - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Verify Backend Database is Ready
```bash
cd backend
npm run dev
# Should show: ✓ Server running on port 5000
```

### 2. Start Web Server  
```bash
cd web
npm run dev
# Should show: ✓ Local: http://localhost:5173
```

### 3. Start Mobile App (Optional)
```bash
cd frontend
npm start
# Should show: Expo server running
```

---

## 📸 Add Your First Gallery Item

### Via Admin Panel (Easiest)

1. **Go to Admin Panel**
   ```
   http://localhost:5173/admin
   ```

2. **Click Gallery Tab**
   - You'll see a password prompt
   - Default admin password: `admin` (or what's in `.env` as `ADMIN_PASSWORD`)

3. **Create First Item**
   - Click **"New Gallery Item"**
   - Title: `Living Room Redesign`
   - Upload a before photo
   - Click **Create**

4. **Add Style Variants**
   - Click on the item to expand it
   - Click **"Add Style"**
   - Style Name: `Modern Minimalist`
   - Category: `minimalism`
   - Upload an after photo
   - Click **"Add Variant"**

5. **View in Gallery**
   ```
   Web:    http://localhost:5173/gallery
   Mobile: Open app → Gallery tab
   ```

---

## 🏗️ Architecture Quick Overview

```
┌─────────────────┐
│   Admin Panel   │
│   (Web)         │
└────────┬────────┘
         │ Upload images
         ↓
┌─────────────────────────────┐
│   Backend API               │
│   - gallery.routes.ts       │
│   - gallery.controller.ts   │
│   - gallery.service.ts      │
└────────┬────────────────────┘
         │
      ┌──┴──┐
      ↓     ↓
   ┌──────────────┐     ┌────────────────┐
   │  Database    │     │  Cloudinary    │
   │  (SQLite)    │     │  (Image Store) │
   └──────────────┘     └────────────────┘
         ↑                        ↑
      ┌──┴──┐                 ┌──┴──┐
      ↓     ↓                 ↓     ↓
   Web   Mobile          Web   Mobile
 Gallery Gallery        Gallery Gallery
```

---

## 📁 Where Things Are

```
backend/
├── src/
│   ├── routes/gallery.routes.ts        ← API routes
│   ├── controllers/gallery.controller.ts → Request handlers  
│   ├── services/gallery.service.ts     ← Business logic
│   └── prisma/schema.prisma            ← Database models
│
web/
├── src/
│   ├── pages/Gallery.tsx               ← Gallery page
│   ├── components/BeforeAfterGallery.tsx → Gallery display
│   ├── pages/Admin.tsx                 ← Admin page
│   └── components/AdminGalleryManagement.tsx → Admin controls
│
frontend/
└── app/gallery.tsx                     ← Mobile gallery screen
```

---

## 🔑 Key Concepts

### GalleryItem
- One "Before" image
- Multiple style variants
- Can have many "After" photos
- Example: `Living Room Redesign` with 3 styles

### GalleryVariant  
- One "After" image
- Belongs to a GalleryItem
- Has a style name and category
- Example: `Modern → gallery/after/modern/image.jpg`

### Style Categories
```
minimalism  → Clean, simple
luxury      → High-end, premium
modern      → Contemporary, sleek
classic     → Traditional, timeless
industrial  → Raw, urban
bohemian    → Eclectic, colorful
```

---

## 🎯 Common Tasks

### Add a New Gallery Item
```bash
curl -X POST http://localhost:5000/api/gallery \
  -H "X-Admin-Password: admin" \
  -F "image=@bedroom.jpg" \
  -F "title=Bedroom Makeover" \
  -F "order=0"
```

### Add a New Variant to Item
```bash
curl -X POST http://localhost:5000/api/gallery/{ITEM_ID}/variants \
  -H "X-Admin-Password: admin" \
  -F "image=@bedroom-modern.jpg" \
  -F "styleName=Modern Luxury" \
  -F "styleCategory=luxury"
```

### Get All Gallery Items
```bash
curl http://localhost:5000/api/gallery
```

### Delete a Gallery Item
```bash
curl -X DELETE http://localhost:5000/api/gallery/{ITEM_ID} \
  -H "X-Admin-Password: admin"
```

---

## 🎨 Customization

### Change Admin Password
In `.env`:
```env
ADMIN_PASSWORD=your_new_secure_password
```

### Add More Style Categories
In `AdminGalleryManagement.tsx`:
```tsx
<select>
  <option value="minimalism">Minimalism</option>
  <option value="luxury">Luxury</option>
  <option value="boho">Boho</option>           {/* Add */}
  <option value="rustic">Rustic</option>     {/* Add */}
</select>
```

### Auto-scroll Gallery
In `BeforeAfterGallery.tsx`:
```tsx
<BeforeAfterGallery 
  autoSlide={true}           {/* Enable auto-scroll */}
  autoSlideInterval={4000}   {/* Every 4 seconds */}
/>
```

---

## 📊 What Gets Stored Where

### Database (SQLite)
```
gallery_items
├── id, title, beforeImageUrl
├── beforePublicId (for deletion)
└── isActive, order, timestamps

gallery_variants  
├── id, styleName, styleCategory
├── afterImageUrl, afterPublicId
└── galleryItemId, order, timestamps
```

### Cloudinary (Cloud Storage)
```
Images organized by:
/gallery/before/{image}
/gallery/after/minimalism/{image}
/gallery/after/luxury/{image}
/gallery/after/modern/{image}
... etc
```

---

## ✅ Quick Tests

### Test 1: Can I Access Admin?
```
→ Go to http://localhost:5173/admin
→ Click Gallery tab
→ Enter password
→ Should load gallery management
```

### Test 2: Can I Upload Images?
```
→ Click "New Gallery Item"
→ Upload any JPG/PNG
→ Should create item
```

### Test 3: Can Web See Gallery?
```
→ Go to http://localhost:5173/gallery
→ Should show your gallery items
```

### Test 4: Can Mobile See Gallery?
```
→ Open mobile app
→ Click Gallery tab
→ Should show gallery items
```

---

## 🐛 Common Problems & Solutions

| Problem | Solution |
|---------|----------|
| Admin password not working | Check `.env` file, restart server |
| Images not uploading | Check Cloudinary credentials, file size < 10MB |
| Gallery appears empty | Verify `isActive = true` in database |
| Mobile shows blank | Update API URL in `frontend/app/gallery.tsx` |
| Images look pixelated | Cloudinary is auto-optimizing; refresh page |

---

## 📚 Full Documentation

For detailed information, see: [GALLERY_SETUP.md](GALLERY_SETUP.md)

Covers:
- Complete architecture
- All API endpoints
- Database schemas
- Deployment guides
- Advanced customization
- Security details

---

## 🎓 Next: Learn the System

1. **Create 5 gallery items** with different styles
2. **Try adding 3-5 variants** to each item
3. **View on web and mobile**
4. **Test deleting items**
5. **Explore the code** to understand how it works

---

## 🚀 You're Ready!

The gallery system is now:
- ✅ Installed
- ✅ Configured  
- ✅ Ready to use
- ✅ Synced across platforms

**Start adding images!** 🎉

---

### Need Help?
- Check `GALLERY_SETUP.md` for detailed docs
- Check browser console for errors
- Check terminal for backend logs
- Verify all servers are running (`npm run dev`)

Enjoy your professional gallery system! 📸
