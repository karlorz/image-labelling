import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AnnotationContext = createContext();

export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotation must be used within AnnotationProvider');
  }
  return context;
};

export const AnnotationProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState({});
  const [activeTool, setActiveTool] = useState('select');
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [labelClasses, setLabelClasses] = useState(['cat', 'dog', 'person', 'car']);

  const addImages = useCallback((newImages) => {
    const imagesWithIds = newImages.map(img => ({
      id: uuidv4(),
      src: img.src,
      name: img.name,
      width: img.width,
      height: img.height
    }));
    
    setImages(prev => [...prev, ...imagesWithIds]);
    
    const newAnnotations = {};
    imagesWithIds.forEach(img => {
      newAnnotations[img.id] = [];
    });
    setAnnotations(prev => ({ ...prev, ...newAnnotations }));
  }, []);

  const updateAnnotations = useCallback((imageId, newAnnotations) => {
    setAnnotations(prev => ({
      ...prev,
      [imageId]: newAnnotations
    }));
  }, []);

  const deleteAnnotation = useCallback((imageId, annotationId) => {
    setAnnotations(prev => ({
      ...prev,
      [imageId]: prev[imageId].filter(ann => ann.id !== annotationId)
    }));
  }, []);

  const updateAnnotationLabel = useCallback((imageId, annotationId, label) => {
    setAnnotations(prev => ({
      ...prev,
      [imageId]: prev[imageId].map(ann =>
        ann.id === annotationId ? { ...ann, label } : ann
      )
    }));
  }, []);

  const nextImage = useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setSelectedAnnotation(null);
    }
  }, [currentImageIndex, images.length]);

  const previousImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setSelectedAnnotation(null);
    }
  }, [currentImageIndex]);

  const exportAnnotations = useCallback(() => {
    const exportData = {
      version: '1.0',
      images: images.map(img => ({
        id: img.id,
        src: img.src,
        name: img.name,
        width: img.width,
        height: img.height,
        annotations: annotations[img.id] || []
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [images, annotations]);

  const importAnnotations = useCallback((jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.images) {
        setImages(data.images);
        
        const importedAnnotations = {};
        data.images.forEach(img => {
          importedAnnotations[img.id] = img.annotations || [];
        });
        setAnnotations(importedAnnotations);
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error('Failed to import annotations:', error);
      alert('Invalid JSON format');
    }
  }, []);

  const currentImage = images[currentImageIndex] || null;
  const currentAnnotations = currentImage ? annotations[currentImage.id] || [] : [];

  const value = {
    images,
    currentImage,
    currentImageIndex,
    annotations: currentAnnotations,
    activeTool,
    selectedAnnotation,
    labelClasses,
    addImages,
    updateAnnotations,
    deleteAnnotation,
    updateAnnotationLabel,
    setActiveTool,
    setSelectedAnnotation,
    nextImage,
    previousImage,
    exportAnnotations,
    importAnnotations,
    setLabelClasses
  };

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
};
