import express from 'express';
import { offerController } from '../controllers/offerController';

const router = express.Router();

router.post('/', offerController.createOffer);
router.post('/:id/respond', offerController.respondToOffer);
router.get('/listing/:listingId', offerController.getOffersForListing);
router.get('/user/:userId', offerController.getUserOffers);

export default router;
