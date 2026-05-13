# 📁 Image Folder Structure — Decora AI

This folder contains all demo images for the Decora AI web app.

## How to Replace Images

Simply replace any `.jpg` file with your own image (keep the same filename).
**No code changes needed!**

## Folder Structure

```
images/
├── rooms/
│   ├── room1/
│   │   ├── original.jpg          ← Original room photo
│   │   └── styles/
│   │       ├── modern.jpg        ← Modern style result
│   │       ├── luxury.jpg        ← Luxury style result
│   │       ├── japanese.jpg      ← Japanese style result
│   │       ├── minimal.jpg       ← Minimal style result
│   │       ├── industrial.jpg    ← Industrial style result
│   │       ├── scandinavian.jpg  ← Scandinavian style result
│   │       └── classic.jpg       ← Classic style result
│   ├── room2/
│   │   ├── original.jpg
│   │   └── styles/ (same as above)
│   ├── room3/
│   │   └── ...
│   └── room4/
│       └── ...
├── hero/
│   └── landing.jpg               ← Landing page hero image
└── avatars/
    └── default.jpg               ← Default user avatar
```

## Image Sizes (Recommended)

| Image Type     | Size          | Aspect Ratio |
|---------------|---------------|--------------|
| Hero          | 1200 x 800px  | 3:2          |
| Room Original | 800 x 1000px  | 4:5          |
| Style Result  | 800 x 1000px  | 4:5          |
| Avatar        | 400 x 400px   | 1:1          |

## How It Works

1. The app checks for local images first (this folder)
2. If an image is not found, it falls back to Unsplash URLs
3. To use only your images, replace all files in this folder
4. To add more rooms, create a new folder (e.g., `room5/`) and update `src/data/rooms.ts`

## Tips

- Use `.jpg` format for best performance
- Keep file sizes under 500KB for fast loading
- Use consistent aspect ratios within each category
