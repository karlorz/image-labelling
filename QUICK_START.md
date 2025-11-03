# Image Labeling Tool - Quick Start Guide

## 🚀 Get Started in 60 Seconds

### Choose Your Variant

```bash
# Option 1: react-konva (RECOMMENDED)
cd image-labeling-konva
npm install && npm run dev

# Option 2: Fabric.js
cd image-labeling-fabric
npm install && npm run dev

# Option 3: Lightweight Charts
cd image-labeling-lightweight
npm install && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎯 Which Variant Should I Use?

### 🥇 Use react-konva if...
- ✅ You want the fastest development
- ✅ You're building a React app
- ✅ You need the smallest bundle (~250KB)
- ✅ You want excellent documentation
- ✅ **This is the default recommendation**

### 🥈 Use Fabric.js if...
- ✅ You need advanced editing features
- ✅ You want built-in vertex editing
- ✅ You need complex canvas operations
- ✅ You're not locked into React

### 🥉 Use Lightweight Charts if...
- ✅ You're already using this library
- ✅ You need chart + annotation hybrid
- ❌ **NOT recommended for annotation-only tools**

---

## 📖 Basic Usage

### 1. Upload an Image
- Drag and drop an image file
- Or click to select from file picker

### 2. Select a Tool
- **Select** (👆): Click to select, drag to move
- **Rectangle** (▭): Click-drag to draw bounding box
- **Polygon** (⬟): Click points, double-click to finish

### 3. Label Your Annotation
- Select an annotation
- Choose label from dropdown or type custom
- Labels appear in sidebar

### 4. Navigate Multiple Images
- Use Previous/Next buttons
- Current image counter shows progress

### 5. Export Your Work
- Click "Export JSON" in sidebar
- Save annotations for later use
- Or "Import JSON" to load previous work

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Delete selected annotation |
| `Escape` | Deselect annotation |

---

## 📦 What's Included?

All three variants have:
- ✅ Rectangle drawing tool
- ✅ Polygon drawing tool
- ✅ Selection and editing
- ✅ Label assignment
- ✅ Multi-image support
- ✅ Export/Import JSON
- ✅ Drag-and-drop upload
- ✅ Modern styled UI

---

## 📊 Feature Comparison

| Feature | Konva | Fabric | Lightweight |
|---------|-------|--------|-------------|
| Bundle Size | 250KB | 280KB | 391KB |
| React Native | ✅ Yes | ⚠️ Wrapper | ⚠️ Custom |
| Learning Curve | Easy | Medium | Hard |
| Performance | Excellent | Good | Excellent |

**Winner**: react-konva for most use cases

---

## 🔍 Project Files

```
image-labelling/
├── image-labeling-konva/       # Variant A (RECOMMENDED)
├── image-labeling-fabric/      # Variant B
├── image-labeling-lightweight/ # Variant C
├── AGENTS.md                   # Project guidelines
├── COMPARISON.md              # Detailed comparison
└── PROJECT_STATUS.md          # Implementation status
```

---

## 📚 Further Reading

- **COMPARISON.md**: Detailed analysis of all variants
- **PROJECT_STATUS.md**: Full implementation details
- **AGENTS.md**: Project requirements and architecture

---

## 🎓 Example JSON Export

```json
{
  "version": "1.0",
  "images": [{
    "id": "uuid",
    "src": "data:image/...",
    "name": "cat.jpg",
    "annotations": [{
      "id": "uuid",
      "type": "rect",
      "x": 100, "y": 100,
      "width": 200, "height": 150,
      "label": "cat"
    }]
  }]
}
```

---

## 💡 Tips

1. **Start with Konva**: Best for most projects
2. **Test with sample images**: Use 1-2MB images for testing
3. **Label as you go**: Easier than batch labeling later
4. **Export frequently**: Save your work often
5. **Try all three**: Compare performance with your use case

---

## ❓ Need Help?

- Check **COMPARISON.md** for detailed analysis
- Review **AGENTS.md** for architecture details
- Each variant has its own **README.md**

---

**Status**: ✅ All variants production-ready
**Recommendation**: Start with **react-konva**
**Time to first annotation**: < 2 minutes

Happy annotating! 🎨
