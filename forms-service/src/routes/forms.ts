import { Router } from 'express';
import { createForm, getForm, getForms, deleteForm } from '../controllers/formController';

const router = Router();

router.post('/', createForm);
router.get('/:id', getForm);
router.get('/', getForms);
router.delete('/:id', deleteForm);

export default router;
