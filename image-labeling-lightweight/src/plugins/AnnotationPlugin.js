import { v4 as uuidv4 } from 'uuid';

export class AnnotationPlugin {
  constructor(options = {}) {
    this._chart = null;
    this._series = null;
    this._annotations = [];
    this._activeAnnotation = null;
    this._selectedAnnotation = null;
    this._activeTool = 'select';
    this._tempPoints = [];
    this._isDragging = false;
    this._dragStart = null;
    this._imageData = null;
    this._imageLoaded = false;
    this._onChange = options.onChange || (() => {});
    this._onSelect = options.onSelect || (() => {});
  }

  attached({ chart, series, requestUpdate }) {
    this._chart = chart;
    this._series = series;
    this._requestUpdate = requestUpdate;
  }

  detached() {
    // Cleanup handled by Annotator component
  }

  hitTest(x, y) {
    // Check if point hits any annotation (used by chart for mouse interaction)
    const hit = this._findAnnotationAtPoint(x, y);
    if (hit) {
      return {
        cursorStyle: this._activeTool === 'select' ? 'pointer' : 'crosshair',
        externalId: hit.id,
        zOrder: 'top'
      };
    }
    return null;
  }

  // Methods to be called from Annotator component via chart event subscriptions
  handleMouseDown(x, y) {
    if (this._activeTool === 'select') {
      this._handleSelectMouseDown(x, y);
    } else if (this._activeTool === 'rect') {
      this._handleRectMouseDown(x, y);
    } else if (this._activeTool === 'polygon') {
      this._handlePolygonClick(x, y);
    }
  }

  handleMouseMove(x, y) {
    if (this._activeTool === 'rect' && this._isDragging) {
      this._handleRectMouseMove(x, y);
    } else if (this._activeTool === 'select' && this._isDragging) {
      this._handleSelectMouseMove(x, y);
    }
    this._requestUpdate();
  }

  handleMouseUp(x, y) {
    if (this._activeTool === 'rect' && this._isDragging) {
      this._handleRectMouseUp();
    } else if (this._activeTool === 'select' && this._isDragging) {
      this._handleSelectMouseUp();
    }
  }

  handleDoubleClick(x, y) {
    if (this._activeTool === 'polygon' && this._tempPoints.length > 2) {
      this._finalizePolygon();
    }
  }

  _handleSelectMouseDown(x, y) {
    const selected = this._findAnnotationAtPoint(x, y);
    
    if (selected) {
      this._selectedAnnotation = selected;
      this._isDragging = true;
      this._dragStart = { x, y };
      this._onSelect(selected);
    } else {
      this._selectedAnnotation = null;
      this._onSelect(null);
    }
    
    this._requestUpdate();
  }

  _handleSelectMouseMove(x, y) {
    if (this._selectedAnnotation && this._dragStart) {
      const dx = x - this._dragStart.x;
      const dy = y - this._dragStart.y;
      
      if (this._selectedAnnotation.type === 'rect') {
        this._selectedAnnotation.x += dx;
        this._selectedAnnotation.y += dy;
      } else if (this._selectedAnnotation.type === 'polygon') {
        this._selectedAnnotation.points = this._selectedAnnotation.points.map(p => ({
          x: p.x + dx,
          y: p.y + dy
        }));
      }
      
      this._dragStart = { x, y };
      this._onChange(this._annotations);
    }
  }

  _handleSelectMouseUp() {
    this._isDragging = false;
    this._dragStart = null;
  }

  _handleRectMouseDown(x, y) {
    this._isDragging = true;
    this._activeAnnotation = {
      id: uuidv4(),
      type: 'rect',
      x,
      y,
      width: 0,
      height: 0,
      color: '#FF6B6B80',
      label: '',
      tags: []
    };
  }

  _handleRectMouseMove(x, y) {
    if (this._activeAnnotation) {
      this._activeAnnotation.width = x - this._activeAnnotation.x;
      this._activeAnnotation.height = y - this._activeAnnotation.y;
    }
  }

  _handleRectMouseUp() {
    if (this._activeAnnotation && 
        Math.abs(this._activeAnnotation.width) > 5 && 
        Math.abs(this._activeAnnotation.height) > 5) {
      
      if (this._activeAnnotation.width < 0) {
        this._activeAnnotation.x += this._activeAnnotation.width;
        this._activeAnnotation.width = Math.abs(this._activeAnnotation.width);
      }
      if (this._activeAnnotation.height < 0) {
        this._activeAnnotation.y += this._activeAnnotation.height;
        this._activeAnnotation.height = Math.abs(this._activeAnnotation.height);
      }
      
      this._annotations.push(this._activeAnnotation);
      this._onChange(this._annotations);
    }
    
    this._activeAnnotation = null;
    this._isDragging = false;
    this._requestUpdate();
  }

  _handlePolygonClick(x, y) {
    this._tempPoints.push({ x, y });
    this._requestUpdate();
  }

  _finalizePolygon() {
    if (this._tempPoints.length > 2) {
      const annotation = {
        id: uuidv4(),
        type: 'polygon',
        points: [...this._tempPoints],
        color: '#4ECDC480',
        label: '',
        tags: []
      };
      
      this._annotations.push(annotation);
      this._onChange(this._annotations);
      this._tempPoints = [];
      this._requestUpdate();
    }
  }

  _findAnnotationAtPoint(x, y) {
    for (let i = this._annotations.length - 1; i >= 0; i--) {
      const ann = this._annotations[i];
      
      if (ann.type === 'rect') {
        if (x >= ann.x && x <= ann.x + ann.width &&
            y >= ann.y && y <= ann.y + ann.height) {
          return ann;
        }
      } else if (ann.type === 'polygon') {
        if (this._isPointInPolygon(x, y, ann.points)) {
          return ann;
        }
      }
    }
    return null;
  }

  _isPointInPolygon(x, y, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      
      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  setTool(tool) {
    this._activeTool = tool;
    this._tempPoints = [];
    this._activeAnnotation = null;
    this._requestUpdate();
  }

  setAnnotations(annotations) {
    this._annotations = annotations;
    this._requestUpdate();
  }

  getAnnotations() {
    return this._annotations;
  }

  deleteSelected() {
    if (this._selectedAnnotation) {
      this._annotations = this._annotations.filter(a => a.id !== this._selectedAnnotation.id);
      this._selectedAnnotation = null;
      this._onChange(this._annotations);
      this._onSelect(null);
      this._requestUpdate();
    }
  }

  updateSelectedLabel(label) {
    if (this._selectedAnnotation) {
      this._selectedAnnotation.label = label;
      this._onChange(this._annotations);
      this._requestUpdate();
    }
  }

  setImage(imageUrl) {
    console.log('[Plugin] setImage called with URL length:', imageUrl?.length);
    const img = new Image();
    img.onload = () => {
      console.log('[Plugin] Image loaded successfully:', img.width, 'x', img.height);
      this._imageData = img;
      this._imageLoaded = true;
      
      // Force chart to redraw by updating series data
      if (this._series) {
        console.log('[Plugin] Forcing chart redraw via series.update()');
        this._series.update({ time: '2023-01-02', value: 100 });
      }
      
      // Also try fitting content to trigger redraw
      if (this._chart) {
        console.log('[Plugin] Calling chart.timeScale().fitContent()');
        this._chart.timeScale().fitContent();
      }
      
      this._requestUpdate();
      console.log('[Plugin] requestUpdate() called');
    };
    img.onerror = (e) => {
      console.error('[Plugin] Image load error:', e);
    };
    img.src = imageUrl;
  }

  renderer() {
    console.log('[Plugin] renderer() method called');
    return {
      draw: (target) => {
        console.log('[Plugin] draw() function called');
        target.useBitmapCoordinateSpace(scope => {
          const ctx = scope.context;
          const width = scope.bitmapSize.width;
          const height = scope.bitmapSize.height;

          ctx.save();

          // Image is now displayed via CSS background - no need to draw it here
          
          // Draw annotations
          this._annotations.forEach(ann => {
            this._drawAnnotation(ctx, ann, ann === this._selectedAnnotation);
          });

          if (this._activeAnnotation) {
            this._drawAnnotation(ctx, this._activeAnnotation, false);
          }

          if (this._activeTool === 'polygon' && this._tempPoints.length > 0) {
            this._drawTempPolygon(ctx);
          }

          ctx.restore();
        });
      }
    };
  }

  _drawAnnotation(ctx, ann, isSelected) {
    ctx.strokeStyle = isSelected ? '#FFD700' : ann.color.replace('80', 'FF');
    ctx.fillStyle = ann.color;
    ctx.lineWidth = isSelected ? 3 : 2;

    if (ann.type === 'rect') {
      ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      
      if (ann.label) {
        ctx.fillStyle = '#000000';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(ann.label, ann.x + 5, ann.y + 20);
      }
    } else if (ann.type === 'polygon' && ann.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        ctx.lineTo(ann.points[i].x, ann.points[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ann.points.forEach(point => {
        ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      if (ann.label && ann.points.length > 0) {
        ctx.fillStyle = '#000000';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(ann.label, ann.points[0].x + 5, ann.points[0].y - 5);
      }
    }
  }

  _drawTempPolygon(ctx) {
    if (this._tempPoints.length === 0) return;

    ctx.strokeStyle = '#4ECDC4';
    ctx.fillStyle = '#4ECDC440';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this._tempPoints[0].x, this._tempPoints[0].y);
    for (let i = 1; i < this._tempPoints.length; i++) {
      ctx.lineTo(this._tempPoints[i].x, this._tempPoints[i].y);
    }
    if (this._tempPoints.length > 2) {
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();

    this._tempPoints.forEach(point => {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#4ECDC4';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
}
