export const mediaService = {
  async uploadFileToCloudinary(file) {
    // Step 1: Ask Netlify for signature
    const sigRes = await fetch("/.netlify/functions/upload-media", { method: "POST" });
    if (!sigRes.ok) {
      throw new Error('Failed to get upload signature');
    }
    const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

    // Step 2: Send file directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return data;
  },

  async uploadMedia(file, treeId, memberId, userId) {
    try {
      // Upload file directly to Cloudinary using signature
      const uploadResult = await this.uploadFileToCloudinary(file);

      // Store reference in Firestore via Netlify function
      const storeResponse = await fetch('/.netlify/functions/manage-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url,
          resource_type: uploadResult.resource_type,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration,
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
