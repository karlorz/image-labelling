import { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';
import styled from 'styled-components';
import { AnnotationPlugin } from '../../plugins/AnnotationPlugin';
import { useAnnotation } from '../../contexts/AnnotationContext';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ImageBackground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 0;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  cursor: ${props => props.$cursor};
  position: relative;
  z-index: 1;
`;

const Annotator = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const pluginRef = useRef(null);
  
  const {
    currentImage,
    annotations,
    activeTool,
    updateAnnotations,
    setSelectedAnnotation,
    selectedAnnotation
  } = useAnnotation();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#333',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
    });

    const series = chart.addSeries(LineSeries, {
      color: 'transparent',
      lineWidth: 0,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    series.setData([
      { time: '2023-01-01', value: 0 },
      { time: '2023-01-02', value: 100 }
    ]);

    const plugin = new AnnotationPlugin({
      onChange: (newAnnotations) => {
        if (currentImage) {
          updateAnnotations(currentImage.id, newAnnotations);
        }
      },
      onSelect: (annotation) => {
        setSelectedAnnotation(annotation);
      }
    });

    series.attachPrimitive(plugin);

    chartRef.current = chart;
    pluginRef.current = plugin;

    // Setup mouse event handling via chart API
    const chartElement = chart.chartElement();
    let isMouseDown = false;
    
    const handleMouseDown = (e) => {
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      isMouseDown = true;
      plugin.handleMouseDown(x, y);
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown && activeTool === 'select') return;
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      plugin.handleMouseMove(x, y);
    };

    const handleMouseUp = (e) => {
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      isMouseDown = false;
      plugin.handleMouseUp(x, y);
    };

    const handleDoubleClick = (e) => {
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      plugin.handleDoubleClick(x, y);
    };

    chartElement.addEventListener('mousedown', handleMouseDown);
    chartElement.addEventListener('mousemove', handleMouseMove);
    chartElement.addEventListener('mouseup', handleMouseUp);
    chartElement.addEventListener('dblclick', handleDoubleClick);

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chartElement.removeEventListener('mousedown', handleMouseDown);
      chartElement.removeEventListener('mousemove', handleMouseMove);
      chartElement.removeEventListener('mouseup', handleMouseUp);
      chartElement.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pluginRef.current && currentImage) {
      // No longer need to set image in plugin since it's in CSS background
      pluginRef.current.setAnnotations(annotations);
    }
  }, [currentImage, annotations]);

  useEffect(() => {
    if (pluginRef.current) {
      pluginRef.current.setTool(activeTool);
    }
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedAnnotation && pluginRef.current) {
        pluginRef.current.deleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedAnnotation(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotation, setSelectedAnnotation]);

  const getCursor = () => {
    switch (activeTool) {
      case 'rect':
      case 'polygon':
        return 'crosshair';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <CanvasContainer>
      {!currentImage ? (
        <>
          <ChartWrapper ref={chartContainerRef} $cursor={getCursor()} style={{ opacity: 0, pointerEvents: 'none' }} />
          <div style={{ textAlign: 'center', color: '#999', zIndex: 10, position: 'relative' }}>
            <p>No image loaded</p>
            <p>Upload an image to start annotating</p>
          </div>
        </>
      ) : (
        <>
          <ImageBackground src={currentImage.src} alt={currentImage.name} />
          <ChartWrapper ref={chartContainerRef} $cursor={getCursor()} />
        </>
      )}
    </CanvasContainer>
  );
};

export default Annotator;
