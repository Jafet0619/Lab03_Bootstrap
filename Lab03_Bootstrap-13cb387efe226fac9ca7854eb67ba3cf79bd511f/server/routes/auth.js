import express from 'express';
import { login, registrar } from '../controllers/authController.js';
import { obtenerListaUsuarios } from '../controllers/usuarioController.js';

const router = express.Router();

router.post('/usuarios/login', login);
router.post('/usuarios/registrar', registrar);
router.get('/usuarios/lista', obtenerListaUsuarios); // Solo admin en frontend

export default router;