import styled from 'styled-components';
import { AnnotationProvider } from './contexts/AnnotationContext';
import Header from './components/Header/Header';
import Toolbar from './components/Toolbar/Toolbar';
import Annotator from './components/Annotator/Annotator';
import Sidebar from './components/Sidebar/Sidebar';
import ImageUploader from './components/ImageUploader/ImageUploader';
import { useAnnotation } from './contexts/AnnotationContext';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #1a1a1a;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CenterContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AppContent = () => {
  const { images } = useAnnotation();

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Toolbar />
        <CenterContent>
          {images.length === 0 ? <ImageUploader /> : <Annotator />}
        </CenterContent>
        <Sidebar />
      </MainContent>
    </AppContainer>
  );
};

function App() {
  return (
    <AnnotationProvider>
      <AppContent />
    </AnnotationProvider>
  );
}

export default App
