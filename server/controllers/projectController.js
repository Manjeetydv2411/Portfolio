import Project from '../models/Project.js';

// @desc    Get all published projects for public portfolio
// @route   GET /api/projects
// @access  Public
export const getPublicProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ published: true })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};
