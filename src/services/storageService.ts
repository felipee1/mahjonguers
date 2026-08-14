import { storage } from '@/config/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const storageService = {
  /**
   * Uploads an image (data URL) and its corrected annotation to Firebase Storage.
   * This allows building a dataset for future YOLOv8 training.
   */
  async uploadCorrection(
    imageDataUrl: string, 
    expectedTileIds: string[], 
    context: string
  ): Promise<{ imageUrl: string; annotationUrl: string }> {
    try {
      const id = uuidv4();
      
      // Upload Image
      const imageRef = ref(storage, `dataset-collection/images/${id}.jpg`);
      await uploadString(imageRef, imageDataUrl, 'data_url');
      const imageUrl = await getDownloadURL(imageRef);

      // Create Annotation JSON
      const annotation = {
        imageId: id,
        timestamp: new Date().toISOString(),
        expectedTileIds,
        context, // e.g., 'dora-selection' or 'scoring-ron'
        imageUrl
      };

      // Upload Annotation
      const annotationDataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(annotation))}`;
      const annotationRef = ref(storage, `dataset-collection/annotations/${id}.json`);
      await uploadString(annotationRef, annotationDataUrl, 'data_url');
      const annotationUrl = await getDownloadURL(annotationRef);

      console.log('Correction uploaded successfully for ML training.');
      
      return { imageUrl, annotationUrl };
    } catch (error) {
      console.error('Error uploading correction to Firebase Storage:', error);
      throw error;
    }
  }
};
