const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success } = require('../utils/response');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [users, channels, streams, subscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.channel.count({ where: { isActive: true } }),
    prisma.stream.count({ where: { isActive: true } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
  ]);
  success(res, { users, channels, streams, activeSubscriptions: subscriptions });
});

exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [newUsers, newSubs, expiredSubs] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.count({ where: { createdAt: { gte: thirtyDaysAgo }, status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', expiresAt: { lt: now } } }),
  ]);
  success(res, { period: '30d', newUsers, newSubscriptions: newSubs, expiredSubscriptions: expiredSubs });
});

exports.getActivityLog = asyncHandler(async (req, res) => {
  // Placeholder — wire up an ActivityLog model or audit trail as needed
  success(res, { logs: [] });
});
