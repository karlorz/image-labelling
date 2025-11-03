import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';

const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #1e1e1e;
  border-right: 1px solid #333;
  min-width: 60px;
`;

const ToolButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  background: ${props => props.$active ? '#0066cc' : '#2a2a2a'};
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$active ? '#0066cc' : '#3a3a3a'};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Toolbar = () => {
  const { activeTool, setActiveTool, currentImage } = useAnnotation();

  const tools = [
    { id: 'select', icon: '⬆️', title: 'Select' },
    { id: 'rect', icon: '⬜', title: 'Rectangle' },
    { id: 'polygon', icon: '🔷', title: 'Polygon' },
  ];

  return (
    <ToolbarContainer>
      {tools.map(tool => (
        <ToolButton
          key={tool.id}
          $active={activeTool === tool.id}
          onClick={() => setActiveTool(tool.id)}
          title={tool.title}
          disabled={!currentImage && tool.id !== 'select'}
        >
          {tool.icon}
        </ToolButton>
      ))}
    </ToolbarContainer>
  );
};

export default Toolbar;
