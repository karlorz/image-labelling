import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';
import { useRef } from 'react';

const SidebarContainer = styled.div`
  width: 300px;
  background: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const AnnotationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const AnnotationItem = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.$selected ? '#E3F6F5' : '#f9f9f9'};
  border: 2px solid ${props => props.$selected ? '#4ECDC4' : 'transparent'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #E3F6F5;
    border-color: #4ECDC4;
  }
`;

const AnnotationType = styled.span`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
`;

const LabelInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }
`;

const LabelSelect = styled.select`
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$variant === 'danger' ? '#FF6B6B' : '#4ECDC4'};
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#ff5252' : '#45b8b0'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #999;
  padding: 32px 16px;
  font-size: 14px;
`;

const Sidebar = () => {
  const {
    annotations,
    selectedAnnotation,
    setSelectedAnnotation,
    currentImage,
    updateAnnotationLabel,
    exportAnnotations,
    importAnnotations
  } = useAnnotation();

  const fileInputRef = useRef(null);

  const handleExport = () => {
    const jsonData = exportAnnotations();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        importAnnotations(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleLabelChange = (e) => {
    if (selectedAnnotation && currentImage) {
      updateAnnotationLabel(currentImage.id, selectedAnnotation.id, e.target.value);
    }
  };

  return (
    <SidebarContainer>
      <Section>
        <SectionTitle>Annotations ({annotations.length})</SectionTitle>
        {selectedAnnotation && (
          <>
            <LabelSelect
              value={selectedAnnotation.label || ''}
              onChange={handleLabelChange}
            >
              <option value="">Select label...</option>
              <option value="cat">Cat</option>
              <option value="dog">Dog</option>
              <option value="person">Person</option>
              <option value="car">Car</option>
            </LabelSelect>
            <LabelInput
              type="text"
              placeholder="Or type custom label..."
              value={selectedAnnotation.label || ''}
              onChange={handleLabelChange}
            />
          </>
        )}
      </Section>

      <AnnotationList>
        {annotations.length === 0 ? (
          <EmptyState>
            No annotations yet.<br />
            Select a tool and start drawing!
          </EmptyState>
        ) : (
          annotations.map((ann) => (
            <AnnotationItem
              key={ann.id}
              $selected={selectedAnnotation?.id === ann.id}
              onClick={() => setSelectedAnnotation(ann)}
            >
              <AnnotationType>{ann.type}</AnnotationType>
              {ann.label && (
                <div style={{ marginTop: '4px', fontWeight: '500' }}>
                  {ann.label}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {ann.type === 'rect' 
                  ? `${Math.round(ann.width)}×${Math.round(ann.height)}px`
                  : `${ann.points?.length || 0} points`
                }
              </div>
            </AnnotationItem>
          ))
        )}
      </AnnotationList>

      <Section>
        <SectionTitle>Export/Import</SectionTitle>
        <Button onClick={handleExport}>
          Export JSON
        </Button>
        <Button onClick={() => fileInputRef.current?.click()}>
          Import JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </Section>
    </SidebarContainer>
  );
};

export default Sidebar;
