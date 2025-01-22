const express = require('express');
const { 
  createProject, 
  getProjects, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectcontroller');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', auth, upload.array('files', 5), createProject);
router.get('/', getProjects);
router.put('/:id', auth, upload.array('files', 5), updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;