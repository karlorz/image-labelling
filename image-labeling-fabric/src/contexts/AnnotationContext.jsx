import { createContext, useContext, useState, useEffect } from 'react';
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
  const [labelClasses, setLabelClasses] = useState(['cat', 'dog', 'person', 'vehicle', 'other']);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const savedData = localStorage.getItem('image-labeling-fabric');
    if (savedData) {
      try {
        const { images: savedImages, annotations: savedAnnotations } = JSON.parse(savedData);
        if (savedImages) setImages(savedImages);
        if (savedAnnotations) setAnnotations(savedAnnotations);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('image-labeling-fabric', JSON.stringify({ images, annotations }));
    }
  }, [images, annotations]);

  const addImage = (imageData) => {
    const newImage = { id: uuidv4(), ...imageData };
    setImages([...images, newImage]);
    setAnnotations({ ...annotations, [newImage.id]: [] });
  };

  const addAnnotation = (imageId, annotation) => {
    const newAnnotation = { id: uuidv4(), ...annotation };
    setAnnotations({
      ...annotations,
      [imageId]: [...(annotations[imageId] || []), newAnnotation],
    });
    return newAnnotation.id;
  };

  const updateAnnotation = (imageId, annotationId, updates) => {
    setAnnotations({
      ...annotations,
      [imageId]: annotations[imageId].map(ann =>
        ann.id === annotationId ? { ...ann, ...updates } : ann
      ),
    });
  };

  const deleteAnnotation = (imageId, annotationId) => {
    setAnnotations({
      ...annotations,
      [imageId]: annotations[imageId].filter(ann => ann.id !== annotationId),
    });
    if (selectedAnnotation === annotationId) {
      setSelectedAnnotation(null);
    }
  };

  const exportAnnotations = () => ({
    version: '1.0',
    images: images.map(img => ({
      id: img.id,
      src: img.src,
      name: img.name,
      width: img.width,
      height: img.height,
      annotations: annotations[img.id] || [],
    })),
  });

  const importAnnotations = (data) => {
    try {
      if (data.version && data.images) {
        const newImages = data.images.map(img => ({
          id: img.id || uuidv4(),
          src: img.src,
          name: img.name,
          width: img.width,
          height: img.height,
        }));
        const newAnnotations = {};
        data.images.forEach(img => {
          newAnnotations[img.id] = img.annotations || [];
        });
        setImages(newImages);
        setAnnotations(newAnnotations);
        setCurrentImageIndex(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  };

  const currentImage = images[currentImageIndex];
  const currentAnnotations = currentImage ? annotations[currentImage.id] || [] : [];

  const value = {
    images,
    currentImageIndex,
    setCurrentImageIndex,
    annotations,
    activeTool,
    setActiveTool,
    selectedAnnotation,
    setSelectedAnnotation,
    labelClasses,
    setLabelClasses,
    zoomLevel,
    setZoomLevel,
    addImage,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    exportAnnotations,
    importAnnotations,
    currentImage,
    currentAnnotations,
  };

  return <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>;
};
