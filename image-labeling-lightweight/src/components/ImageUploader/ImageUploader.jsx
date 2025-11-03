import { useRef } from 'react';
import styled from 'styled-components';
import { useAnnotation } from '../../contexts/AnnotationContext';

const UploaderContainer = styled.div`
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const DropZone = styled.div`
  border: 2px dashed #4ECDC4;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$isDragging ? '#E3F6F5' : '#f9f9f9'};

  &:hover {
    background: #E3F6F5;
    border-color: #45b8b0;
  }
`;

const UploadButton = styled.button`
  padding: 10px 24px;
  background: #4ECDC4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;

  &:hover {
    background: #45b8b0;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ImageUploader = () => {
  const { addImages } = useAnnotation();
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    const loadedImages = await Promise.all(
      imageFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              resolve({
                src: e.target.result,
                name: file.name,
                width: img.width,
                height: img.height
              });
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        });
      })
    );

    addImages(loadedImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <UploaderContainer>
      <DropZone
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClick}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
          Drop images here or click to upload
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Supports JPG, PNG
        </div>
        <UploadButton>
          Select Images
        </UploadButton>
      </DropZone>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </UploaderContainer>
  );
};

export default ImageUploader;
