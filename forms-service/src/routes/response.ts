import { Router } from 'express';
import { postResponse } from '../controllers/responseController';

const router = Router();

router.post('/', postResponse);

export default router;