import { Router, type Request, type Response } from 'express';

const router = Router();

// Cette route permet à l'application mobile de vérifier si elle est à jour
router.get('/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0', // Version actuelle de l'APK
    min_version: '1.0.0', // Version minimale requise pour fonctionner
    update_url: 'https://medigo-api-vxrv.onrender.com/download/medigo-latest.apk'
  });
});

export default router;
