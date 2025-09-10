const validateProject = (req, res, next) => {
  const { title, studentId } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Project title is required' });
  }
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  next();
};

const validateStudent = (req, res, next) => {
  const { studentId, firstName, lastName, email, year, program } = req.body;
  
  const requiredFields = { studentId, firstName, lastName, email, year, program };
  
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Validate year
  if (!Number.isInteger(year) || year < 1 || year > 4) {
    return res.status(400).json({ error: 'Year must be between 1 and 4' });
  }
  
  next();
};

const validateUser = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  const requiredFields = { username, email, password, firstName, lastName };
  
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || value.trim().length === 0) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  next();
};

module.exports = {
  validateProject,
  validateStudent,
  validateUser,
};