const express = require('express');
const { addBorrowing, getBorrowings, updateBorrowing, deleteBorrowing, verifyToken } = require('../controller/borrowingController');

const router = express.Router();

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Routes
router.post('/', addBorrowing);
router.get('/', getBorrowings);
router.patch('/:id', updateBorrowing);
router.delete('/:id', deleteBorrowing);

module.exports = router;