const { v2: cloudinary } = require('cloudinary');
const formidable = require('formidable');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    const [fields, files] = await form.parse(event.body);
    const file = files.file[0];
    
    if (!file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file provided' }),
      };
    }

    // Determine resource type
    const resourceType = file.mimetype.startsWith('audio/') ? 'video' : 'image';
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      resource_type: resourceType,
      folder: `tafyaa/${fields.treeId || 'general'}`,
      public_id: `${Date.now()}_${file.originalFilename}`,
      transformation: resourceType === 'image' ? [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ] : undefined
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration
        }
      }),
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Upload failed',
        message: error.message 
      }),
    };
  }
};
