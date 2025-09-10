const express = require('express');
const { Op } = require('sequelize');
const { Student, Project } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateStudent } = require('../middleware/validation');

const router = express.Router();

// Get all students with filtering and sorting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      year,
      program,
      sortBy = 'lastName',
      sortOrder = 'ASC',
      search,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = { isActive: true };
    
    // Apply filters
    if (year) {
      whereClause.year = parseInt(year);
    }
    
    if (program) {
      whereClause.program = { [Op.like]: `%${program}%` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { studentId: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Project,
          as: 'projects',
          attributes: ['id', 'title', 'status'],
          where: { isActive: true },
          required: false,
        },
      ],
    });

    res.json({
      students: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single student
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: Project,
          as: 'projects',
          where: { isActive: true },
          required: false,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new student
router.post('/', authenticateToken, validateStudent, async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      message: 'Student created successfully',
      student,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Student ID already exists' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error('Create student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update student
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update(req.body);

    res.json({
      message: 'Student updated successfully',
      student,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Student ID already exists' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error('Update student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete student (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student has active projects
    const activeProjects = await Project.count({
      where: { studentId: student.id, isActive: true },
    });

    if (activeProjects > 0) {
      return res.status(409).json({
        error: 'Cannot delete student with active projects',
        activeProjectsCount: activeProjects,
      });
    }

    await student.update({ isActive: false });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get students for dropdown/select (simplified response)
router.get('/list/simple', authenticateToken, async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { isActive: true },
      attributes: ['id', 'studentId', 'firstName', 'lastName'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      value: student.id,
      label: `${student.firstName} ${student.lastName} (${student.studentId})`,
      studentId: student.studentId,
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Get simple students list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;