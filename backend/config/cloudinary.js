const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'qxiwsbze',
  api_key: process.env.CLOUDINARY_API_KEY || '525818853834352',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'U5-EW2h8jGXIUjsGobvdhY5mW1g'
});

module.exports = cloudinary;
