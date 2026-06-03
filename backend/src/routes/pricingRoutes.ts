/**
 * Pricing Routes — public pricing endpoint
 */

import express from 'express';
import { getPricing } from '../controllers/pricingController';

const router = express.Router();

router.get('/', getPricing);

export default router;
