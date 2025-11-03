import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';

const ToolbarContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
`;

const ToolButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? '#4ECDC4' : '#ddd'};
  background: ${props => props.$active ? '#4ECDC4' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#333'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #4ECDC4;
    background: ${props => props.$active ? '#45b8b0' : '#f0f0f0'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: #e0e0e0;
  margin: 0 8px;
`;

const ToolLabel = styled.span`
  font-size: 12px;
  color: #666;
  margin-right: 8px;
`;

const Toolbar = () => {
  const { activeTool, setActiveTool } = useAnnotation();

  const tools = [
    { id: 'select', label: 'Select', icon: '👆' },
    { id: 'rect', label: 'Rectangle', icon: '▭' },
    { id: 'polygon', label: 'Polygon', icon: '⬟' },
  ];

  return (
    <ToolbarContainer>
      <ToolLabel>Tools:</ToolLabel>
      {tools.map((tool, index) => (
        <div key={tool.id} style={{ display: 'flex', alignItems: 'center' }}>
          <ToolButton
            $active={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
          >
            <span style={{ marginRight: '6px' }}>{tool.icon}</span>
            {tool.label}
          </ToolButton>
          {index < tools.length - 1 && <Divider />}
        </div>
      ))}
      
      {activeTool === 'polygon' && (
        <ToolLabel style={{ marginLeft: '16px', color: '#4ECDC4' }}>
          Click to add points, double-click to finish
        </ToolLabel>
      )}
    </ToolbarContainer>
  );
};

export default Toolbar;
