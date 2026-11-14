import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Upload project image to Cloudinary
// @route   POST /api/admin/upload
// @access  Private (Admin)
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file.');
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
