const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validateProjectData = (data) => {
  const { title, description, institution, projectType, skillLevel } = data;
  
  if (!title || !description || !institution || !projectType || !skillLevel) {
    return false;
  }

  return true;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateProjectData
}; 