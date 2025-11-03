# Image Labeling Tool - Lightweight Charts Variant

This is the **Lightweight Charts** implementation variant of the Image Labeling Demo, using TradingView's Lightweight Charts library with a custom plugin system for annotation overlays.

## 🎯 Key Features

- **Custom Annotation Plugin**: Implements drawing primitives (rectangles/polygons) via Lightweight Charts' plugin API
- **Rectangle Tool**: Click and drag to create bounding boxes
- **Polygon Tool**: Multi-click to create precise outlines (double-click to finish)
- **Selection Tool**: Click to select, drag to move annotations
- **Label Assignment**: Assign classes to annotations with dropdown or custom input
- **Export/Import**: Save and load annotations in JSON format
- **Multi-Image Support**: Navigate between multiple uploaded images
- **Keyboard Shortcuts**: Delete key to remove selected annotation, Escape to deselect

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## 📦 Dependencies

- **lightweight-charts**: Chart library with plugin system
- **react**: UI framework
- **styled-components**: CSS-in-JS styling
- **uuid**: Unique ID generation

## 🎨 Usage

1. **Upload Images**: Drag and drop or click to select image files
2. **Select Tool**: Choose Rectangle or Polygon from toolbar
3. **Draw Annotations**: Rectangle (click-drag), Polygon (click points, double-click to finish)
4. **Label Annotations**: Select annotation, choose label from sidebar
5. **Export**: Click "Export JSON" to save annotations
6. **Navigate**: Use Previous/Next buttons for multiple images

## 📝 License

MIT

