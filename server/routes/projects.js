const express = require('express');
const { Op } = require('sequelize');
const { sequelize, Project, Student, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

const router = express.Router();

// Get all projects with filtering and sorting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      student,
      producer,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = { isActive: true };
    
    // Apply filters
    if (status) {
      whereClause.status = status;
    }
    
    if (producer) {
      whereClause.supervisingProducer = { [Op.like]: `%${producer}%` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { supervisingProducer: { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } },
      ];
    }

    const include = [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'studentId', 'firstName', 'lastName', 'email'],
      },
    ];
    
    // Filter by student if specified
    if (student) {
      include[0].where = {
        [Op.or]: [
          { studentId: { [Op.like]: `%${student}%` } },
          { firstName: { [Op.like]: `%${student}%` } },
          { lastName: { [Op.like]: `%${student}%` } },
        ],
      };
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      include,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      projects: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'firstName', 'lastName', 'email', 'phone', 'year', 'program'],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', authenticateToken, validateProject, async (req, res) => {
  try {
    // Check if student exists
    const student = await Student.findOne({
      where: { id: req.body.studentId, isActive: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const project = await Project.create({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    // Fetch the created project with student details
    const createdProject = await Project.findOne({
      where: { id: project.id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: createdProject,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // If studentId is being updated, verify the student exists
    if (req.body.studentId && req.body.studentId !== project.studentId) {
      const student = await Student.findOne({
        where: { id: req.body.studentId, isActive: true },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
    }

    await project.update({
      ...req.body,
      updatedBy: req.user.id,
    });

    // Fetch updated project with student details
    const updatedProject = await Project.findOne({
      where: { id: project.id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete project (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update({ isActive: false, updatedBy: req.user.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { isActive: true },
      group: ['status'],
      raw: true,
    });

    const totalProjects = await Project.count({ where: { isActive: true } });

    res.json({
      totalProjects,
      statusBreakdown: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;