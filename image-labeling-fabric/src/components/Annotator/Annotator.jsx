import { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { useAnnotation } from '../../contexts/AnnotationContext';

const Annotator = () => {
  const {
    currentImage,
    currentAnnotations,
    activeTool,
    selectedAnnotation,
    setSelectedAnnotation,
    addAnnotation,
    updateAnnotation,
    zoomLevel,
  } = useAnnotation();

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempRect, setTempRect] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: '#2a2a2a',
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e) => {
      if (e.selected[0]?.annotationId) {
        setSelectedAnnotation(e.selected[0].annotationId);
      }
    });

    canvas.on('selection:updated', (e) => {
      if (e.selected[0]?.annotationId) {
        setSelectedAnnotation(e.selected[0].annotationId);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedAnnotation(null);
    });

    return () => {
      canvas.dispose();
    };
  }, [dimensions]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !currentImage) return;

    const loadImage = async () => {
      try {
        canvas.clear();
        canvas.backgroundColor = '#2a2a2a';
        canvas.renderAll();

        const img = await fabric.FabricImage.fromURL(currentImage.src, {
          crossOrigin: 'anonymous'
        });
        
        canvas.setWidth(dimensions.width);
        canvas.setHeight(dimensions.height);
        
        img.set({
          scaleX: zoomLevel,
          scaleY: zoomLevel
        });
        canvas.backgroundImage = img;

        currentAnnotations.forEach((ann) => {
          if (ann.type === 'rect') {
            const rect = new fabric.Rect({
              left: ann.x * zoomLevel,
              top: ann.y * zoomLevel,
              width: ann.width * zoomLevel,
              height: ann.height * zoomLevel,
              fill: 'transparent',
              stroke: ann.color || '#00ff00',
              strokeWidth: 2,
              selectable: true,
              annotationId: ann.id,
            });

            rect.on('modified', () => {
              const scaleX = rect.scaleX || 1;
              const scaleY = rect.scaleY || 1;
              updateAnnotation(currentImage.id, ann.id, {
                x: rect.left / zoomLevel,
                y: rect.top / zoomLevel,
                width: (rect.width * scaleX) / zoomLevel,
                height: (rect.height * scaleY) / zoomLevel,
              });
            });

            canvas.add(rect);
          } else if (ann.type === 'polygon' && ann.points) {
            const scaledPoints = ann.points.map(p => ({ x: p[0] * zoomLevel, y: p[1] * zoomLevel }));
            const polygon = new fabric.Polygon(scaledPoints, {
              fill: 'rgba(255, 0, 0, 0.1)',
              stroke: ann.color || '#ff0000',
              strokeWidth: 2,
              selectable: true,
              annotationId: ann.id,
            });

            canvas.add(polygon);
          }
        });

        canvas.renderAll();
      } catch (error) {
        console.error('Error loading image:', error);
        // Keep canvas visible even on error
        canvas.backgroundColor = '#2a2a2a';
        canvas.renderAll();
      }
    };

    loadImage();
  }, [currentImage, currentAnnotations, zoomLevel, dimensions, updateAnnotation]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      if (activeTool === 'select' || !currentImage) return;
      const pointer = canvas.getViewportPoint(e);

      if (activeTool === 'rect') {
        setIsDrawing(true);
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: '#00ff00',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: false,
        });
        canvas.add(rect);
        setTempRect(rect);
      } else if (activeTool === 'polygon') {
        const points = [...polygonPoints, [pointer.x / zoomLevel, pointer.y / zoomLevel]];
        setPolygonPoints(points);

        canvas.getObjects().forEach(obj => {
          if (obj.tempPolygon) canvas.remove(obj);
        });

        if (points.length > 0) {
          const scaledPoints = points.map(p => ({ x: p[0] * zoomLevel, y: p[1] * zoomLevel }));
          const line = new fabric.Polyline(scaledPoints, {
            stroke: '#ff0000',
            strokeWidth: 2,
            fill: 'transparent',
            strokeDashArray: [5, 5],
            selectable: false,
            tempPolygon: true,
          });
          canvas.add(line);

          points.forEach(p => {
            const circle = new fabric.Circle({
              left: p[0] * zoomLevel - 3,
              top: p[1] * zoomLevel - 3,
              radius: 3,
              fill: '#ff0000',
              selectable: false,
              tempPolygon: true,
            });
            canvas.add(circle);
          });
        }
        canvas.renderAll();
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !tempRect || activeTool !== 'rect') return;
      const pointer = canvas.getViewportPoint(e);
      tempRect.set({
        width: pointer.x - tempRect.left,
        height: pointer.y - tempRect.top,
      });
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isDrawing && tempRect && currentImage) {
        const width = tempRect.width * (tempRect.scaleX || 1);
        const height = tempRect.height * (tempRect.scaleY || 1);
        if (Math.abs(width) > 5 && Math.abs(height) > 5) {
          addAnnotation(currentImage.id, {
            type: 'rect',
            x: tempRect.left / zoomLevel,
            y: tempRect.top / zoomLevel,
            width: width / zoomLevel,
            height: height / zoomLevel,
            color: '#00ff00',
            label: '',
          });
        }
        canvas.remove(tempRect);
        setIsDrawing(false);
        setTempRect(null);
      }
    };

    const handleDblClick = () => {
      if (activeTool === 'polygon' && polygonPoints.length >= 3 && currentImage) {
        addAnnotation(currentImage.id, {
          type: 'polygon',
          points: polygonPoints,
          color: '#ff0000',
          label: '',
        });

        canvas.getObjects().forEach(obj => {
          if (obj.tempPolygon) canvas.remove(obj);
        });
        setPolygonPoints([]);
        canvas.renderAll();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:dblclick', handleDblClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:dblclick', handleDblClick);
    };
  }, [activeTool, isDrawing, tempRect, polygonPoints, currentImage, zoomLevel]);

  if (!currentImage) {
    return (
      <div ref={containerRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <p style={{ color: '#999' }}>No image loaded. Upload an image to start annotating.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', background: '#2a2a2a' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Annotator;
