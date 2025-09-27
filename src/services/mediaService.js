export const mediaService = {
  // Upload media using Netlify function
  async uploadMedia(file, treeId, memberId, userId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('treeId', treeId);
      formData.append('memberId', memberId || '');

      // Upload to Cloudinary via Netlify function
      const uploadResponse = await fetch('/.netlify/functions/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();

      // Store reference in Firestore via Netlify function
      const storeResponse = await fetch('/.netlify/functions/manage-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...uploadResult.data,
          treeId,
          memberId,
          uploadedBy: userId,
        }),
      });

      if (!storeResponse.ok) {
        throw new Error('Failed to store media reference');
      }

      const storeResult = await storeResponse.json();
      return storeResult.data;

    } catch (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  },

  // Get media by ID
  async getMedia(mediaId) {
    try {
      const response = await fetch(`/.netlify/functions/manage-media/${mediaId}`);
      
      if (!response.ok) {
        throw new Error('Media not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(`Failed to get media: ${error.message}`);
    }
  },

  // Delete media
  async deleteMedia(mediaId) {
    try {
      const response = await fetch(`/.netlify/functions/manage-media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }
};
