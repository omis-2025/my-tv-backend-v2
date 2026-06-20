const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error, paginated } = require('../utils/response');

exports.getProfile = asyncHandler(async (req, res) => {
  const { password, ...user } = req.user;
  success(res, { user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, avatar },
    select: { id: true, email: true, name: true, avatar: true, role: true },
  });
  success(res, { user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return error(res, 'Current password is incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
  success(res, null, 'Password changed successfully');
});

exports.getMySubscription = asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.findFirst({
    where: { userId: req.user.id, status: 'ACTIVE' },
    include: { package: true },
  });
  success(res, { subscription: sub });
});

exports.getWatchlist = asyncHandler(async (req, res) => {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId: req.user.id },
    include: { channel: true },
  });
  success(res, { watchlist });
});

exports.addToWatchlist = asyncHandler(async (req, res) => {
  const item = await prisma.watchlist.upsert({
    where: { userId_channelId: { userId: req.user.id, channelId: req.params.channelId } },
    update: {},
    create: { userId: req.user.id, channelId: req.params.channelId },
  });
  success(res, { item }, 'Added to watchlist', 201);
});

exports.removeFromWatchlist = asyncHandler(async (req, res) => {
  await prisma.watchlist.deleteMany({
    where: { userId: req.user.id, channelId: req.params.channelId },
  });
  success(res, null, 'Removed from watchlist');
});

exports.listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const skip = (page - 1) * limit;
  const where = {
    ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }),
    ...(role && { role }),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: +limit, select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  paginated(res, users, { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) return error(res, 'User not found', 404);
  success(res, { user });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: req.body.isActive },
    select: { id: true, isActive: true },
  });
  success(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  success(res, null, 'User deleted');
});
