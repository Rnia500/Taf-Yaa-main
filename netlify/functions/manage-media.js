const { v2: cloudinary } = require('cloudinary');
const admin = require('firebase-admin');

// Initialize Firebase Admin (for server-side operations)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { httpMethod, path, queryStringParameters } = event;
    const pathParts = path.split('/').filter(Boolean);
    const mediaId = pathParts[pathParts.length - 1];

    switch (httpMethod) {
      case 'GET':
        // GET /media/:id - Get media details
        if (mediaId) {
          const mediaDoc = await db.collection('media').doc(mediaId).get();
          
          if (!mediaDoc.exists) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Media not found' }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: { id: mediaDoc.id, ...mediaDoc.data() }
            }),
          };
        }
        break;

      case 'POST':
        // POST /media - Store media reference in Firestore
        const body = JSON.parse(event.body);
        const mediaData = {
          cloudinaryId: body.public_id,
          url: body.secure_url,
          type: body.resource_type === 'video' ? 'audio' : 'image',
          format: body.format,
          size: body.bytes,
          width: body.width || null,
          height: body.height || null,
          duration: body.duration || null,
          treeId: body.treeId,
          memberId: body.memberId || null,
          uploadedBy: body.uploadedBy,
          uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const mediaRef = await db.collection('media').add(mediaData);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: { id: mediaRef.id, ...mediaData }
          }),
        };

      case 'DELETE':
        // DELETE /media/:id - Delete from both Cloudinary and Firestore
        if (mediaId) {
          const mediaDoc = await db.collection('media').doc(mediaId).get();
          
          if (!mediaDoc.exists) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Media not found' }),
            };
          }

          const mediaData = mediaDoc.data();
          
          // Delete from Cloudinary
          await cloudinary.uploader.destroy(mediaData.cloudinaryId, {
            resource_type: mediaData.type === 'audio' ? 'video' : 'image'
          });
          
          // Delete from Firestore
          await db.collection('media').doc(mediaId).delete();
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Media deleted' }),
          };
        }
        break;

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

  } catch (error) {
    console.error('Media management error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
