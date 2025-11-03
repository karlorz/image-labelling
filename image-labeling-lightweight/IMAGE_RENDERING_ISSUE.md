# Image Not Rendering in Lightweight Charts

## Problem
Real image file (image_001.jpg, 1635x1280) uploads successfully and loads in the plugin, but **does not appear on the canvas**. The renderer's draw() method is never being called.

## Confirmed Working
✅ File upload successful
✅ Image loads via FileReader (data URL created)
✅ Plugin.setImage() called correctly (URL length: 159547)
✅ Image object loads successfully (1635x1280 dimensions)
✅ `_imageLoaded = true` and `_imageData` contains the image

## The Core Issue
❌ **renderer().draw() is NEVER called** - no console logs from the draw method
❌ Canvas remains blank (white background)
❌ `_requestUpdate()` doesn't trigger a redraw

## Root Cause Analysis

### Why renderer() isn't called:
In lightweight-charts, the primitive's renderer is only invoked when:
1. The chart needs to redraw
2. The series has data points
3. Something in the chart's state changes

Our current implementation:
```javascript
const series = chart.addSeries(LineSeries, { ... });
series.setData([
  { time: '2023-01-01', value: 0 },
  { time: '2023-01-02', value: 100 }
]);
series.attachPrimitive(plugin);
```

**Problem**: The data is set BEFORE the image loads. When the image loads and calls `_requestUpdate()`, the chart may not see a reason to redraw because:
- The series data hasn't changed
- The time scale/price scale haven't changed
- No user interaction has occurred

## Attempted Fixes That Didn't Work
1. ❌ Manual resize event - Chart resize handler runs but doesn't trigger primitive renderer
2. ❌ Logging in renderer - Confirms renderer is never called
3. ❌ Waiting for state changes - Image loads but no automatic redraw

## Solution Options

### Option 1: Force Chart Redraw After Image Loads (RECOMMENDED)
Modify `setImage()` to force a chart redraw:
```javascript
setImage(imageUrl) {
  const img = new Image();
  img.onload = () => {
    this._imageData = img;
    this._imageLoaded = true;
    
    // Force chart to redraw by updating series data
    if (this._series) {
      this._series.update({ time: '2023-01-02', value: 100 });
    }
    
    this._requestUpdate();
  };
  img.src = imageUrl;
}
```

### Option 2: Use Custom Series Instead of Primitive
Custom series have more control over rendering lifecycle. Would require more refactoring.

### Option 3: Use Background Image on Chart Container
Draw image on a separate canvas/layer behind the chart. Simpler but less integrated.

## Next Steps
1. Implement Option 1 (series.update() to trigger redraw)
2. Test if renderer gets called after image loads
3. Verify image appears on canvas

## Technical Notes
- Lightweight-charts v5 primitives are "lazy" - they only render when needed
- `requestUpdate()` is a hint, not a command
- Series data changes are the most reliable trigger for redraws
- The primitive architecture assumes you're drawing ON TOP of chart data, not replacing the background

## Status
🔴 **BLOCKED** - Image loads but renderer never executes
📋 **NEXT**: Try forcing chart update via series.update()
