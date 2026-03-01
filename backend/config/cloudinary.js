const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Connect to your Cloudinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tell Cloudinary where and how to store files
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusconnect_resources', // folder name in your Cloudinary
    allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg'],
    resource_type: 'raw', // 'raw' means non-image files like PDF
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };