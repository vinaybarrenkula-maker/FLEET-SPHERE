const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `fleetsphere/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });
};

const createUploader = (folder, allowedFormats) => {
  return multer({
    storage: createStorage(folder, allowedFormats),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowed = allowedFormats || ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type .${ext} is not allowed. Allowed: ${allowed.join(', ')}`), false);
      }
    },
  });
};

// Uploaders for different entity types
const uploaders = {
  documents: createUploader('documents', ['jpg', 'jpeg', 'png', 'pdf']),
  evidence: createUploader('incidents', ['jpg', 'jpeg', 'png', 'mp4', 'mov']),
  receipts: createUploader('receipts', ['jpg', 'jpeg', 'png', 'pdf']),
  profiles: createUploader('profiles', ['jpg', 'jpeg', 'png', 'webp']),
  logos: createUploader('logos', ['jpg', 'jpeg', 'png', 'webp', 'svg']),
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

const uploadBase64 = async (base64String, folder) => {
  const result = await cloudinary.uploader.upload(base64String, {
    folder: `fleetsphere/${folder}`,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

module.exports = {
  cloudinary,
  uploaders,
  deleteFromCloudinary,
  uploadBase64,
};
