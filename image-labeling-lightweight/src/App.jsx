import styled from 'styled-components';
import { AnnotationProvider, useAnnotation } from './contexts/AnnotationContext';
import Toolbar from './components/Toolbar/Toolbar';
import Annotator from './components/Annotator/Annotator';
import Sidebar from './components/Sidebar/Sidebar';
import ImageUploader from './components/ImageUploader/ImageUploader';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const NavControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NavButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImageCounter = styled.span`
  font-size: 14px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Badge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 12px;
  font-weight: 500;
`;

function AppContent() {
  const { 
    images, 
    currentImageIndex, 
    nextImage, 
    previousImage,
    currentImage 
  } = useAnnotation();

  return (
    <AppContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title>Image Labeling Tool</Title>
          <Badge>Lightweight Charts Variant</Badge>
        </div>
        <NavControls>
          {images.length > 0 && (
            <>
              <NavButton
                onClick={previousImage}
                disabled={currentImageIndex === 0}
              >
                ← Previous
              </NavButton>
              <ImageCounter>
                {currentImageIndex + 1} / {images.length}
              </ImageCounter>
              <NavButton
                onClick={nextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                Next →
              </NavButton>
            </>
          )}
        </NavControls>
      </Header>

      <MainContent>
        <CenterPanel>
          {!currentImage && <ImageUploader />}
          <Toolbar />
          <Annotator />
        </CenterPanel>
        <Sidebar />
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <AnnotationProvider>
      <AppContent />
    </AnnotationProvider>
  );
}

export default App;
