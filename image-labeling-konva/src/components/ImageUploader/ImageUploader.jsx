import { useRef } from 'react';
import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';

const Container = styled.div`
  padding: 20px;
  background: #2a2a2a;
  border-radius: 8px;
  margin: 20px;
`;

const DropZone = styled.div`
  border: 2px dashed #666;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.$isDragging ? '#3a3a3a' : 'transparent'};

  &:hover {
    border-color: #0066cc;
    background: #3a3a3a;
  }
`;

const Text = styled.p`
  color: #aaa;
  margin: 8px 0;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0052a3;
  }
`;

const ImageUploader = () => {
  const { addImage } = useAnnotation();
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 50 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            addImage({
              src: e.target.result,
              name: file.name,
              width: img.width,
              height: img.height,
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Container>
      <DropZone
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Text>📁</Text>
        <Text><strong>Drag and drop images here</strong></Text>
        <Text>or</Text>
        <Button>Browse Files</Button>
        <Text style={{ fontSize: '12px', marginTop: '12px' }}>
          Supported: JPEG, PNG (max 50MB)
        </Text>
      </DropZone>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Container>
  );
};

export default ImageUploader;
