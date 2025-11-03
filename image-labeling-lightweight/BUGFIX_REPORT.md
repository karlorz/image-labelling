# Lightweight Charts Rendering Bug Fix

## Problem Summary
The Lightweight Charts variant of the image labeling app was not rendering any canvas elements. The UI loaded but the chart container remained empty.

## Root Causes Identified

### 1. **Incorrect API Usage** (CRITICAL)
- **Issue**: Using `chart.addLineSeries()` which doesn't exist in lightweight-charts v5+
- **Location**: `src/components/Annotator/Annotator.jsx`
- **Fix**: Import `LineSeries` and use `chart.addSeries(LineSeries, options)`
- **Error**: `chart.addLineSeries is not a function`

### 2. **Direct Canvas DOM Manipulation** (CRITICAL)
- **Issue**: Plugin attempted to `querySelector('canvas')` and attach event listeners directly
- **Location**: `src/plugins/AnnotationPlugin.js` lines 38-49
- **Problem**: Canvas doesn't exist yet during `attached()` lifecycle, and this violates lightweight-charts architecture
- **Fix**: Removed `_setupCanvas()`, moved event handling to Annotator component

### 3. **Conditional Rendering Breaking Refs** (HIGH)
- **Issue**: ChartWrapper ref was conditionally rendered, causing ref to be null
- **Location**: `src/components/Annotator/Annotator.jsx` line 192-201
- **Problem**: When `!currentImage`, early return prevented ChartWrapper from rendering
- **Fix**: Always render ChartWrapper, conditionally show overlay message

## Changes Made

### File: `src/plugins/AnnotationPlugin.js`

**Removed:**
- `_canvas` and `_ctx` class properties
- `_setupCanvas()` method (lines 38-49)
- Direct canvas event listeners in `detached()` (lines 29-36)
- `_handleMouseDown/Move/Up` methods that accessed `this._canvas`

**Added:**
- `hitTest(x, y)` method for proper lightweight-charts interaction
- Public `handleMouseDown/Move/Up/DoubleClick` methods callable from Annotator
- Proper cleanup in `detached()`

### File: `src/components/Annotator/Annotator.jsx`

**Changed:**
```javascript
// OLD - v4 API
import { createChart } from 'lightweight-charts';
const series = chart.addLineSeries({ ... });

// NEW - v5 API
import { createChart, LineSeries } from 'lightweight-charts';
const series = chart.addSeries(LineSeries, { ... });
```

**Changed:**
```javascript
// OLD - Conditional rendering breaks ref
if (!currentImage) {
  return <CanvasContainer>...</CanvasContainer>;
}
return <CanvasContainer><ChartWrapper ref={...} /></CanvasContainer>;

// NEW - Always render ChartWrapper
return (
  <CanvasContainer>
    {!currentImage ? (
      <>
        <ChartWrapper ref={chartContainerRef} style={{ opacity: 0 }} />
        <div>No image loaded</div>
      </>
    ) : (
      <ChartWrapper ref={chartContainerRef} />
    )}
  </CanvasContainer>
);
```

**Added:**
- Chart-level mouse event handlers attached to `chart.chartElement()`
- Proper event delegation to plugin methods
- Cleanup of event listeners in useEffect return

## Test Results

### Before Fix
- ✗ No canvas elements in DOM (0 canvases)
- ✗ Chart container empty
- ✗ Console error: "chart.addLineSeries is not a function"

### After Fix
- ✅ Chart renders successfully (4 canvases, 1 table detected)
- ✅ No console errors
- ✅ Proper lightweight-charts structure visible
- ✅ Canvas dimensions: 1936x628 (responsive to container)
- ✅ Image upload working
- ✅ Tool selection functional

## Key Architectural Insights

### Lightweight Charts Plugin Pattern
1. **Don't access DOM directly** - Use provided APIs
2. **renderer()** method is the ONLY place to draw
3. **attached()** should just store references
4. **Mouse events** should use chart subscriptions or be handled at component level
5. **hitTest()** method for interactive primitives

### Correct Implementation Flow
```
Component creates chart
  ↓
Chart creates canvas internally
  ↓
Plugin attached via series.attachPrimitive()
  ↓
Plugin implements renderer() for drawing
  ↓
Component handles DOM events → calls plugin methods
```

## Documentation References
- [Lightweight Charts v5 Migration Guide](https://tradingview.github.io/lightweight-charts/docs/migrations/from-v4-to-v5)
- [Custom Series Primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/intro)
- DeepWiki: Mouse event handling in primitives

## Recommendations

1. **For Production**: Add TypeScript for better API type checking
2. **Testing**: Add integration tests for chart rendering
3. **Performance**: The current implementation is already optimized (using primitives correctly)
4. **Features**: Drawing annotations now ready to be tested with actual mouse interactions

## Status
✅ **FIXED** - Chart now renders correctly
🔄 **NEXT**: Test annotation drawing/editing with real user interactions
