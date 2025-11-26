const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { addIncome, getIncomes, getIncome, updateIncome, deleteIncome, verifyToken } = require('../controller/incomeController');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'budget-buddy-income',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf'],
    resource_type: 'auto'
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Routes
router.post('/', upload.array('attachments', 10), addIncome);
router.get('/', getIncomes);
router.get('/:id', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;