import { useState } from 'react';
import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';

const SidebarContainer = styled.div`
  width: 300px;
  background: #1e1e1e;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

const AnnotationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnnotationItem = styled.div`
  padding: 12px;
  background: ${props => props.$selected ? '#0066cc' : '#2a2a2a'};
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-size: 13px;

  &:hover {
    background: ${props => props.$selected ? '#0066cc' : '#3a3a3a'};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  margin-top: 8px;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  margin-top: 8px;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: #0052a3;
  }
`;

const DeleteButton = styled(Button)`
  background: #d32f2f;
  &:hover {
    background: #b71c1c;
  }
`;

const Sidebar = () => {
  const {
    currentImage,
    currentAnnotations,
    selectedAnnotation,
    setSelectedAnnotation,
    labelClasses,
    updateAnnotation,
    deleteAnnotation,
    exportAnnotations,
    importAnnotations,
  } = useAnnotation();

  const [editingLabel, setEditingLabel] = useState('');
  const selectedAnn = currentAnnotations.find(ann => ann.id === selectedAnnotation);

  const handleExport = () => {
    const data = exportAnnotations();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (importAnnotations(data)) {
            alert('Annotations imported successfully!');
          } else {
            alert('Invalid annotation format');
          }
        } catch (error) {
          alert('Failed to import annotations');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLabelUpdate = () => {
    if (selectedAnn && currentImage && editingLabel) {
      updateAnnotation(currentImage.id, selectedAnn.id, { label: editingLabel });
    }
  };

  const handleDelete = () => {
    if (selectedAnn && currentImage) {
      deleteAnnotation(currentImage.id, selectedAnn.id);
    }
  };

  return (
    <SidebarContainer>
      <Section>
        <Title>Annotations ({currentAnnotations.length})</Title>
        <AnnotationList>
          {currentAnnotations.map((ann) => (
            <AnnotationItem
              key={ann.id}
              $selected={ann.id === selectedAnnotation}
              onClick={() => setSelectedAnnotation(ann.id)}
            >
              <div><strong>{ann.type}</strong></div>
              {ann.label && <div>Label: {ann.label}</div>}
            </AnnotationItem>
          ))}
        </AnnotationList>
      </Section>

      {selectedAnn && (
        <Section>
          <Title>Edit Annotation</Title>
          <div>
            <label style={{ color: '#aaa', fontSize: '12px' }}>Label</label>
            <Input
              type="text"
              value={editingLabel || selectedAnn.label || ''}
              onChange={(e) => setEditingLabel(e.target.value)}
              onBlur={handleLabelUpdate}
              placeholder="Enter label"
            />
          </div>
          <div>
            <label style={{ color: '#aaa', fontSize: '12px' }}>Class</label>
            <Select
              value={selectedAnn.label || ''}
              onChange={(e) => {
                setEditingLabel(e.target.value);
                updateAnnotation(currentImage.id, selectedAnn.id, { label: e.target.value });
              }}
            >
              <option value="">Select class...</option>
              {labelClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </Select>
          </div>
          <DeleteButton onClick={handleDelete}>Delete Annotation</DeleteButton>
        </Section>
      )}

      <Section>
        <Title>Export/Import</Title>
        <Button onClick={handleExport}>Export JSON</Button>
        <Button as="label" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
          Import JSON
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </Button>
      </Section>
    </SidebarContainer>
  );
};

export default Sidebar;
