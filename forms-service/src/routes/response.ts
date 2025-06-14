import { Router } from 'express';
import { getResponses, postResponse } from '../controllers/responseController';

const router = Router();

router.post('/', postResponse);
router.get('/', getResponses);

export default router;