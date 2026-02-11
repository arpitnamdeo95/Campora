const express = require('express');
const router = express.Router();
const controller = require('../controllers/listingController');

router.get('/', controller.getListings);
router.post('/', controller.createListing);
router.post('/suggest-price', controller.suggestPrice);
router.get('/:id', controller.getListingById);

module.exports = router;
