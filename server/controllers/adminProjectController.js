import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all projects for admin dashboard
// @route   GET /api/admin/projects
// @access  Private (Admin)
export const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/admin/projects
// @access  Private (Admin)
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      category,
      year,
      summary,
      description,
      tools,
      coverImage,
      coverImagePublicId,
      liveUrl,
      sourceUrl,
      backendArchitecture,
      keyFeatures,
      featured,
      published,
      displayOrder,
    } = req.body;

    if (!title || !title.trim() || !summary || !summary.trim() || !description || !description.trim()) {
      res.status(400);
      throw new Error('Please provide title, summary, and description.');
    }

    const project = await Project.create({
      title: title.trim(),
      category: category ? category.trim() : 'Full-Stack Web App',
      year: year ? year.trim() : '2026',
      summary: summary.trim(),
      description: description.trim(),
      tools: Array.isArray(tools) ? tools : (typeof tools === 'string' ? tools.split(',').map(t => t.trim()).filter(Boolean) : []),
      coverImage: coverImage ? coverImage.trim() : '',
      coverImagePublicId: coverImagePublicId ? coverImagePublicId.trim() : '',
      liveUrl: liveUrl ? liveUrl.trim() : '',
      sourceUrl: sourceUrl ? sourceUrl.trim() : '',
      backendArchitecture: backendArchitecture ? backendArchitecture.trim() : '',
      keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : (typeof keyFeatures === 'string' ? keyFeatures.split('\n').map(f => f.trim()).filter(Boolean) : []),
      featured: Boolean(featured),
      published: published !== undefined ? Boolean(published) : true,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PATCH /api/admin/projects/:id
// @access  Private (Admin)
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid project ID format.');
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found.');
    }

    const {
      title,
      category,
      year,
      summary,
      description,
      tools,
      coverImage,
      coverImagePublicId,
      liveUrl,
      sourceUrl,
      backendArchitecture,
      keyFeatures,
      featured,
      published,
      displayOrder,
    } = req.body;

    // Check if coverImage is being replaced and old image exists
    const oldPublicId = project.coverImagePublicId;

    if (title !== undefined) project.title = title.trim();
    if (category !== undefined) project.category = category.trim();
    if (year !== undefined) project.year = year.trim();
    if (summary !== undefined) project.summary = summary.trim();
    if (description !== undefined) project.description = description.trim();
    if (tools !== undefined) {
      project.tools = Array.isArray(tools) ? tools : (typeof tools === 'string' ? tools.split(',').map(t => t.trim()).filter(Boolean) : []);
    }
    if (coverImage !== undefined) project.coverImage = coverImage.trim();
    if (coverImagePublicId !== undefined) project.coverImagePublicId = coverImagePublicId.trim();
    if (liveUrl !== undefined) project.liveUrl = liveUrl.trim();
    if (sourceUrl !== undefined) project.sourceUrl = sourceUrl.trim();
    if (backendArchitecture !== undefined) project.backendArchitecture = backendArchitecture.trim();
    if (keyFeatures !== undefined) {
      project.keyFeatures = Array.isArray(keyFeatures) ? keyFeatures : (typeof keyFeatures === 'string' ? keyFeatures.split('\n').map(f => f.trim()).filter(Boolean) : []);
    }
    if (featured !== undefined) project.featured = Boolean(featured);
    if (published !== undefined) project.published = Boolean(published);
    if (displayOrder !== undefined) project.displayOrder = Number(displayOrder);

    const updatedProject = await project.save();

    // If a new coverImagePublicId was provided and it differs from the old one, delete the old image from Cloudinary
    if (coverImagePublicId !== undefined && oldPublicId && oldPublicId !== coverImagePublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin)
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid project ID format.');
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found.');
    }

    const publicId = project.coverImagePublicId;

    await project.deleteOne();

    // Delete associated image from Cloudinary if exists
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
