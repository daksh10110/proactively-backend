import { Router } from 'express';
import { login, register } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.options('/register', (req, res) => {
    res.sendStatus(204);
});
router.options('/login', (req, res) => {
    res.sendStatus(204);
});

export default router;
