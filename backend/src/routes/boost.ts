import express from 'express';
import { boostController } from '../controllers/boostController';

const router = express.Router();

router.post('/:listingId', boostController.boostListing);
router.delete('/:listingId', boostController.removeBoost);

export default router;
