import ContactMessage from '../models/ContactMessage.js';

// @desc    Get analytics overview, message counts, activity over time, and recent messages
// @route   GET /api/admin/analytics/overview
// @access  Private (Admin)
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    // 1. Summary Counts in parallel
    const [total, unread, read, replied] = await Promise.all([
      ContactMessage.countDocuments({}),
      ContactMessage.countDocuments({ status: 'unread' }),
      ContactMessage.countDocuments({ status: 'read' }),
      ContactMessage.countDocuments({ status: 'replied' }),
    ]);

    // 2. Activity for last 30 days using aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const activity30Days = await ContactMessage.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // 3. Activity for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activity7Days = await ContactMessage.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // 4. 5 Most recent contact messages
    const recentMessages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          unread,
          read,
          replied,
        },
        activity7Days,
        activity30Days,
        recentMessages,
      },
    });
  } catch (error) {
    next(error);
  }
};
