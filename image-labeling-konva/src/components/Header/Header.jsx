import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';

const HeaderContainer = styled.header`
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #2a2a2a;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #3a3a3a;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ImageInfo = styled.div`
  color: #aaa;
  font-size: 13px;
`;

const ZoomControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Header = () => {
  const {
    images,
    currentImageIndex,
    setCurrentImageIndex,
    currentImage,
    zoomLevel,
    setZoomLevel,
  } = useAnnotation();

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <HeaderContainer>
      <Title>Image Labeling - Konva</Title>
      <Controls>
        {images.length > 0 && (
          <>
            <ImageInfo>
              {currentImageIndex + 1} / {images.length}
              {currentImage && ` - ${currentImage.name}`}
            </ImageInfo>
            <Button onClick={handlePrevious} disabled={currentImageIndex === 0}>
              ← Previous
            </Button>
            <Button onClick={handleNext} disabled={currentImageIndex >= images.length - 1}>
              Next →
            </Button>
            <ZoomControls>
              <Button onClick={handleZoomOut}>-</Button>
              <span style={{ color: '#aaa', fontSize: '13px', minWidth: '50px', textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button onClick={handleZoomIn}>+</Button>
              <Button onClick={handleResetZoom}>Reset</Button>
            </ZoomControls>
          </>
        )}
      </Controls>
    </HeaderContainer>
  );
};

export default Header;
