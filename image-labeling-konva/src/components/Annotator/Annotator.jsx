import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Line, Circle, Transformer } from 'react-konva';
import { useAnnotation } from '../../contexts/AnnotationContext';
import useImage from 'use-image';

const ImageLayer = ({ src }) => {
  const [image] = useImage(src, 'anonymous');
  return <KonvaImage image={image} />;
};

const Rectangle = ({ annotation, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        ref={shapeRef}
        x={annotation.x}
        y={annotation.y}
        width={annotation.width}
        height={annotation.height}
        stroke={annotation.color || '#00ff00'}
        strokeWidth={2}
        fill={isSelected ? 'rgba(0, 255, 0, 0.1)' : 'transparent'}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...annotation,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...annotation,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

const Polygon = ({ annotation, isSelected, onSelect, onChange }) => {
  const points = annotation.points || [];
  const flatPoints = points.flat();

  return (
    <>
      <Line
        points={flatPoints}
        stroke={annotation.color || '#ff0000'}
        strokeWidth={2}
        fill={isSelected ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.05)'}
        closed
        onClick={onSelect}
        onTap={onSelect}
      />
      {isSelected && points.map((point, i) => (
        <Circle
          key={i}
          x={point[0]}
          y={point[1]}
          radius={5}
          fill="#ff0000"
          draggable
          onDragMove={(e) => {
            const newPoints = [...points];
            newPoints[i] = [e.target.x(), e.target.y()];
            onChange({ ...annotation, points: newPoints });
          }}
        />
      ))}
    </>
  );
};

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

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
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

  const handleMouseDown = (e) => {
    if (activeTool === 'select' || !currentImage) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledPos = { x: pos.x / zoomLevel, y: pos.y / zoomLevel };

    if (activeTool === 'rect') {
      setIsDrawing(true);
      setNewAnnotation({
        type: 'rect',
        x: scaledPos.x,
        y: scaledPos.y,
        width: 0,
        height: 0,
        color: '#00ff00',
      });
    } else if (activeTool === 'polygon') {
      setPolygonPoints([...polygonPoints, [scaledPos.x, scaledPos.y]]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newAnnotation || activeTool !== 'rect') return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledPos = { x: pos.x / zoomLevel, y: pos.y / zoomLevel };
    setNewAnnotation({
      ...newAnnotation,
      width: scaledPos.x - newAnnotation.x,
      height: scaledPos.y - newAnnotation.y,
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && newAnnotation && currentImage) {
      if (Math.abs(newAnnotation.width) > 5 && Math.abs(newAnnotation.height) > 5) {
        addAnnotation(currentImage.id, {
          ...newAnnotation,
          label: '',
        });
      }
      setIsDrawing(false);
      setNewAnnotation(null);
    }
  };

  const handleDoubleClick = () => {
    if (activeTool === 'polygon' && polygonPoints.length >= 3 && currentImage) {
      addAnnotation(currentImage.id, {
        type: 'polygon',
        points: polygonPoints,
        color: '#ff0000',
        label: '',
      });
      setPolygonPoints([]);
    }
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedAnnotation(null);
    }
  };

  if (!currentImage) {
    return (
      <div ref={containerRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <p style={{ color: '#999' }}>No image loaded. Upload an image to start annotating.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', background: '#2a2a2a' }}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        onClick={handleStageClick}
      >
        <Layer>
          <ImageLayer src={currentImage.src} />
          {currentAnnotations.map((ann) =>
            ann.type === 'rect' ? (
              <Rectangle
                key={ann.id}
                annotation={ann}
                isSelected={ann.id === selectedAnnotation}
                onSelect={() => setSelectedAnnotation(ann.id)}
                onChange={(updates) => updateAnnotation(currentImage.id, ann.id, updates)}
              />
            ) : (
              <Polygon
                key={ann.id}
                annotation={ann}
                isSelected={ann.id === selectedAnnotation}
                onSelect={() => setSelectedAnnotation(ann.id)}
                onChange={(updates) => updateAnnotation(currentImage.id, ann.id, updates)}
              />
            )
          )}
          {newAnnotation && newAnnotation.type === 'rect' && (
            <Rect
              x={newAnnotation.x}
              y={newAnnotation.y}
              width={newAnnotation.width}
              height={newAnnotation.height}
              stroke="#00ff00"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
          {polygonPoints.length > 0 && (
            <>
              <Line
                points={polygonPoints.flat()}
                stroke="#ff0000"
                strokeWidth={2}
                dash={[5, 5]}
              />
              {polygonPoints.map((point, i) => (
                <Circle key={i} x={point[0]} y={point[1]} radius={4} fill="#ff0000" />
              ))}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Annotator;
