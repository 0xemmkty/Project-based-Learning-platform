const express = require('express');
console.log("--------enter into router----------");
const { 
  createProject, 
  getProjects, 
  getProjectById,
  updateProject, 
  deleteProject 
} = require('../controllers/projectcontroller');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();
console.log("enter into projectrouter")
router.post('/', auth, upload.array('files', 5), createProject);
router.get('/', getProjects);
router.put('/:id', auth, upload.array('files', 5), updateProject);
router.delete('/:id', auth, deleteProject);
router.get('/:id', getProjectById);

module.exports = router;