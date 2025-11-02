import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import * as codeCtrl from '../controllers/code.controller.js'


const router = Router();

router.post('/run', authUser, codeCtrl.runcode);
router.post('/save', authUser, codeCtrl.saveCode);
router.get('/submissions', authUser, codeCtrl.getSubmissions);
router.get('/submissions/:id', authUser, codeCtrl.getSubmissionById);
router.delete('/submissions/:id', authUser, codeCtrl.deleteSubmissionById);



export default router;