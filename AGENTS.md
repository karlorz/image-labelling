# Image Labeling Demo - Project Guidelines & Memory

## Project Overview
This document outlines the requirements and guidelines for a quick demo web app focused on image labeling. The app allows users to upload images, draw annotations (rectangles for bounding boxes and polygons for precise outlines), assign labels/classes, and export annotations in JSON format for data labeling tasks (e.g., ML datasets). The demo emphasizes simplicity, production-readiness, and interactivity, drawing inspiration from tools like Fabric.js demos.

The UI will be templated after react-image-annotate (from UniversalDataTool), which provides a structured layout with a header bar, central image viewer, toolbar for tools, and optional sidebar for labels/classes. This template ensures an intuitive interface for batch labeling.

**Project Scope**: 1-2 days for a minimal viable demo built with React as a single-page application (SPA).

## Core Architecture Decisions

### Primary Tech Stack & Library Variants
- **Framework**: React 18+ with hooks-based state management
- **State Management**: React hooks (no Redux for demo)
- **Build Tool**: Vite for optimal dev experience and performance (or Create React App)
- **UI Template**: Inspired by react-image-annotate's layout structure
  - Fork structure: `npm install react-image-annotate` (customize props for our libs)
- **Dependencies**: Minimal; add styled-components for CSS if needed

#### Drawing Library Options - THREE SEPARATE VARIANTS FOR COMPARISON:

**IMPORTANT**: The project requires implementing THREE distinct variants of the annotation app, each using a different drawing library. This allows for direct comparison of performance, developer experience, and capabilities.

1. **Variant A - react-konva Implementation**:
   - Based on Konva.js for core canvas drawing
   - Highly performant for shapes on images
   - Supports declarative React components
   - Battle-tested for production annotation apps (handles 1000+ shapes with GPU acceleration)
   - Installation: `npm install react-konva konva`
   - Project folder: `image-labeling-konva/`

2. **Variant B - Fabric.js Implementation**:
   - Object-oriented canvas manipulation with React wrappers (uncontrolled components)
   - Ideal for editable shapes and serialization
   - Widely used for interactive demos
   - Excellent for customization needs
   - Installation: `npm install fabric` (wrap in useRef for React)
   - Project folder: `image-labeling-fabric/`

3. **Variant C - TradingView's Lightweight Charts Implementation**:
   - Via plugin system for custom overlays
   - Drawing primitives (rectangles/polygons) on static "chart" canvases treated as images
   - Suitable for scalable, real-time-like annotations
   - Requires custom plugins for non-time-series use
   - Installation: `npm install lightweight-charts` (create custom drawing primitives plugin)
   - Project folder: `image-labeling-lightweight/`

### Key Design Principles
1. **Modularity**: Separate concerns into distinct components (viewer, toolbar, annotations)
2. **Performance-First**: Handle 4K images with 60FPS target
3. **Client-Side Only**: No backend dependencies for demo
4. **Production-Ready**: Use battle-tested libraries, proper error handling

## Functional Requirements

### Image Handling
- Upload single or multiple images (JPEG/PNG) via drag-and-drop or file input
- Display images in a central viewer with zoom/pan capabilities:
  - Konva: Use Stage scaling
  - Fabric: Use zoomToPoint method
- Support pre-loaded images with initial annotations (from JSON)

### Annotation Tools (Focus on Rectangles and Polygons)

#### Rectangle (Bounding Box)
- Click-and-drag to draw
- Resize/drag/delete post-creation
- Implementation:
  - react-konva: Use `<Rect>` component
  - Fabric.js: Use `fabric.Rect`

#### Polygon
- Multi-click to add vertices
- Close on double-click or Enter key
- Edit vertices individually
- Implementation:
  - react-konva: Use `<Polygon>` component
  - Fabric.js: Use path-based polygons

#### Tool Controls
- Tool switching via toolbar buttons (select, rect, poly modes)
- Template from react-image-annotate's enabledTools prop
- Editing: Hover highlights, click to select
- Support undo/redo via library history or simple stack

### Labeling and Classification
- Assign classes (e.g., "cat", "dog") to regions or whole images
- Add tags (e.g., "indoor", "outdoor")
- Support mutually exclusive/inclusive options (per react-image-annotate props like regionClsList)
- Popup editors for labels on shape selection

### Export/Import
- Export annotations as JSON format:
  ```json
  {
    "image": "src",
    "regions": [{
      "type": "rect",
      "coords": [...],
      "class": "cat"
    }]
  }
  ```
- Import from JSON to load pre-annotated images

### Navigation and Batch Mode
- Previous/Next buttons for multi-image datasets
- Save progress locally via localStorage
- Track current image index and total count

## Non-Functional Requirements

### Performance
- Handle high-res images (up to 4K) without lag
- Use layered canvases for efficient re-renders:
  - Konva/Fabric optimization techniques
  - Lightweight Charts' dirty-region updates
- Target 60FPS on modern browsers
- Only render visible annotations for large datasets

### Compatibility
- Desktop-first design (Chrome 90+, Firefox 88+, Edge 90+)
- Touch support for mobile via library events
- File API: Check for drag-and-drop support

### Accessibility
- Keyboard navigation for tools
- ARIA labels on interactive elements
- Tab order management for UI components

### Security
- Client-side only demo (no server-side dependencies)
- Sanitize file uploads (check MIME types)
- Limit file sizes (e.g., 50MB max)
- XSS prevention in label inputs

### Best Practices
- Modular code structure (separate components for viewer, toolbar)
- Use React hooks for state management (useState for active tool)
- Avoid direct DOM manipulation outside libraries
- Type checking with PropTypes or TypeScript (future)

## Component Structure

```

```

## State Management Strategy

### Global State (via Context)
```javascript
{
  images: [],              // Array of uploaded images
  currentImageIndex: 0,    // Active image
  annotations: {           // Per-image annotations
    [imageId]: []
  },
  activeTool: 'select',    // Current tool mode
  selectedAnnotation: null,// Currently selected shape
  config: {               // App settings
    labelClasses: [],
    enabledTools: []
  }
}
```

### Local Component State
- Drawing temporary states (mouse positions, preview shapes)
- UI states (sidebar open/closed, zoom level)

## UI Design (Templated from react-image-annotate)

### Layout Structure
- **Header**:
  - Task description display
  - Navigation controls (Previous/Next/Save buttons)
  - Settings icon
- **Toolbar (Left/Top)**:
  - Tool selection icons (select, rectangle, polygon, delete)
  - Visual feedback for active tool
- **Image Viewer (Center)**:
  - Canvas with image background
  - Overlay for annotations
  - Zoom/pan controls
- **Sidebar (Right)**:
  - List of current annotations
  - Class/tag selectors
  - Export/Import buttons

### Styles and Interactions
- Clean, responsive design
- Use CSS from react-image-annotate template (e.g., import Inter font)
- Rubber-band preview while drawing shapes
- Drag handles for shape editing
- Visual hover states for interactive elements

## Drawing Implementation Guidelines

### react-konva Pattern
```javascript
// Core drawing setup
<Stage width={width} height={height} onMouseDown={handleMouseDown}>
  <Layer>
    <Image image={imageElement} />
    {annotations.map(annotation =>
      annotation.type === 'rect'
        ? <Rect {...annotation} />
        : <Polygon {...annotation} />
    )}
  </Layer>
</Stage>
```

### Example Implementation (Variant A - react-konva)
```jsx
import { Stage, Layer, Image, Rect, Polygon } from 'react-konva';

const AnnotatorKonva = ({ imageSrc, shapes }) => (
  <Stage width={800} height={600}>
    <Layer>
      <Image image={new window.Image()} src={imageSrc} />
      {shapes.map(s =>
        s.type === 'rect'
          ? <Rect {...s.coords} fill={s.color} draggable />
          : <Polygon {...s.coords} fill={s.color} draggable />
      )}
    </Layer>
  </Stage>
);
```

### Example Implementation (Variant B - Fabric.js)
```jsx
import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const AnnotatorFabric = ({ imageSrc, shapes }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);

    // Load image
    fabric.Image.fromURL(imageSrc, (img) => {
      canvas.setBackgroundImage(img);
      canvas.renderAll();
    });

    // Add shapes
    shapes.forEach(shape => {
      if (shape.type === 'rect') {
        const rect = new fabric.Rect({
          left: shape.x,
          top: shape.y,
          width: shape.width,
          height: shape.height,
          fill: shape.color
        });
        canvas.add(rect);
      }
    });

    return () => canvas.dispose();
  }, [imageSrc, shapes]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};
```

### Example Implementation (Variant C - Lightweight Charts)
```jsx
import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const AnnotatorLightweight = ({ imageSrc, shapes }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: 800,
      height: 600
    });

    // Custom plugin for annotation overlay
    class AnnotationPlugin {
      constructor() {
        this._renderer = null;
      }

      renderer(renderer) {
        this._renderer = renderer;
        // Custom drawing logic for shapes
      }

      draw() {
        // Draw rectangles and polygons
        shapes.forEach(shape => {
          // Custom drawing implementation
        });
      }
    }

    const plugin = new AnnotationPlugin();
    chart.addPlugin(plugin);

    return () => chart.remove();
  }, [imageSrc, shapes]);

  return <div ref={chartContainerRef} />;
};
```

### Shape Data Structure
```javascript
{
  id: 'uuid',
  type: 'rect' | 'polygon',
  coordinates: [...],      // Format depends on type
  label: 'string',
  tags: [],
  color: '#hex',
  metadata: {}
}
```

## Performance Optimizations
1. **Layering**: Separate static (image) and dynamic (annotations) layers
2. **Virtualization**: Only render visible annotations for large datasets
3. **Debouncing**: Throttle expensive operations (zoom, pan)
4. **Memoization**: Use React.memo for shape components
5. **Web Workers**: Offload JSON processing for large exports

## Event Handling Patterns

### Tool-Specific Mouse Handlers
```javascript
const toolHandlers = {
  rect: {
    onMouseDown: startDrawingRect,
    onMouseMove: updateRectPreview,
    onMouseUp: finalizeRect
  },
  polygon: {
    onClick: addPolygonPoint,
    onDoubleClick: closePolygon
  }
};
```

## Export/Import Format
```json
{
  "version": "1.0",
  "images": [{
    "id": "image-uuid",
    "src": "base64 or url",
    "width": 1920,
    "height": 1080,
    "annotations": [{
      "type": "rect",
      "coordinates": [x, y, width, height],
      "label": "cat",
      "confidence": 1.0
    }]
  }]
}
```

## Development Workflow

### Project Structure - Three Variants
Create three separate React projects for comparison:

```bash
# Root directory structure
image-labelling/
├── image-labeling-konva/      # Variant A: react-konva implementation
├── image-labeling-fabric/     # Variant B: Fabric.js implementation
├── image-labeling-lightweight/# Variant C: Lightweight Charts implementation
├── AGENTS.md                   # This file - shared guidelines
└── comparison-results.md       # Performance & usability comparison results
```

### Initial Setup for Each Variant

#### Variant A - react-konva Setup
```bash
npm create vite@latest image-labeling-konva -- --template react
cd image-labeling-konva
npm install react-konva konva uuid
npm install styled-components # For CSS if needed
```

#### Variant B - Fabric.js Setup
```bash
npm create vite@latest image-labeling-fabric -- --template react
cd image-labeling-fabric
npm install fabric uuid
npm install styled-components # For CSS if needed
```

#### Variant C - Lightweight Charts Setup
```bash
npm create vite@latest image-labeling-lightweight -- --template react
cd image-labeling-lightweight
npm install lightweight-charts uuid
npm install styled-components # For CSS if needed
```

### Core Components Structure
Each variant should implement the same components with library-specific adaptations:

#### Variant A - react-konva Components
- **Annotator.js**: `<Stage><Layer><Image /><Rect /><Polygon /></Layer></Stage>`
- Declarative React components for shapes
- Event handlers as props

#### Variant B - Fabric.js Components
- **Annotator.js**: Initialize `fabric.Canvas` in useRef
- Imperative API for shape manipulation
- Event listeners on canvas instance

#### Variant C - Lightweight Charts Components
- **Annotator.js**: Custom plugin for drawing primitives
- Chart instance with overlay rendering
- Custom event handling through plugin API

### Component Development Order
1. Basic App structure with layout
2. ImageUploader with drag-and-drop
3. Simple canvas with image display
4. Rectangle drawing tool
5. Polygon drawing tool
6. Selection and editing
7. Label assignment UI
8. Export/import functionality
9. Multi-image navigation
10. Performance optimizations

### Variants Implementation
- Each variant must implement the SAME features for fair comparison
- Use shared components where possible (UI layout, state management)
- Library-specific code should be isolated in the Annotator component
- Maintain consistent JSON export format across all variants

## Comparison Criteria for Three Variants

### Performance Metrics
1. **Rendering Performance**
   - FPS with 100, 500, 1000+ annotations
   - Initial load time with 4K images
   - Memory usage patterns
   - Zoom/pan responsiveness

2. **Developer Experience**
   - Lines of code required
   - API learning curve
   - Documentation quality
   - Community support
   - TypeScript support

3. **Feature Capabilities**
   - Ease of implementing rectangles
   - Ease of implementing polygons
   - Selection and editing flexibility
   - Undo/redo implementation
   - Export/import reliability

4. **Browser Compatibility**
   - Cross-browser support
   - Mobile/touch support
   - Canvas fallback options

5. **Production Readiness**
   - Bundle size impact
   - Error handling
   - Edge case handling
   - Long-term maintenance

### Comparison Results Documentation
Create a `comparison-results.md` file with:
- Performance benchmarks table
- Code complexity analysis
- Feature implementation difficulty ratings
- Pros/cons for each library
- Final recommendation based on use case

## Testing Strategy
- **Unit Tests**: Export/import logic, coordinate calculations
- **Integration Tests**: Tool switching, annotation persistence
- **Manual Testing**: Drawing accuracy, performance with large images

## Common Pitfalls to Avoid
1. **Direct DOM manipulation** - Use React's declarative approach
2. **Uncontrolled canvas state** - Keep canvas in sync with React state
3. **Memory leaks** - Clean up event listeners and image objects
4. **Blocking UI** - Use async for file operations
5. **Lost annotations** - Auto-save to localStorage

## Browser Compatibility Notes
- Primary: Chrome 90+, Firefox 88+, Edge 90+
- Touch events: Requires pointer events polyfill for older browsers
- File API: Check for drag-and-drop support

## Security Considerations
- Sanitize file inputs (check MIME types)
- Limit file sizes (e.g., 50MB max)
- No external API calls in demo mode
- XSS prevention in label inputs

## Future Enhancements (Post-Demo)
- [ ] Backend integration for collaborative labeling
- [ ] AI-assisted pre-labeling
- [ ] Video frame annotation
- [ ] 3D bounding boxes
- [ ] COCO/YOLO format export
- [ ] Keyboard shortcuts system
- [ ] Undo/redo with history stack

## Code Style Guidelines
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components under 200 lines
- Extract custom hooks for complex logic
- Use descriptive variable names
- Comment complex algorithms
- Type checking with PropTypes or TypeScript (future)

## Git Workflow
- Feature branches from main
- Meaningful commit messages
- Test before committing
- Keep PRs focused and small

## References
- [react-konva docs](https://konvajs.org/docs/react/)
- [Fabric.js docs](http://fabricjs.com/docs/)
- [react-image-annotate](https://github.com/UniversalDataTool/react-image-annotate)

---
Last Updated: 2025-11-03
Project Status: Initial Setup Phase