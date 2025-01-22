const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('institution').optional(),
];

const projectValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('projectType').isIn(['ENTREPRENEURSHIP', 'INNOVATION', 'PRODUCT_DEVELOPMENT'])
    .withMessage('Invalid project type'),
  body('skillLevel').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Invalid skill level'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  registerValidation,
  projectValidation,
  validate
}; 