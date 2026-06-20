const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error, paginated } = require('../utils/response');

exports.listChannels = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, category, search, country } = req.query;
  const skip = (page - 1) * limit;
  const where = {
    isActive: true,
    ...(category && { category }),
    ...(country && { country }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };
  const [channels, total] = await Promise.all([
    prisma.channel.findMany({ where, skip, take: +limit, orderBy: { sortOrder: 'asc' } }),
    prisma.channel.count({ where }),
  ]);
  paginated(res, channels, { page: +page, limit: +limit, total });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const cats = await prisma.channel.groupBy({ by: ['category'], _count: true, where: { isActive: true } });
  success(res, { categories: cats });
});

exports.getChannel = asyncHandler(async (req, res) => {
  const channel = await prisma.channel.findUnique({ where: { id: req.params.id } });
  if (!channel) return error(res, 'Channel not found', 404);
  success(res, { channel });
});

exports.getStreamUrl = asyncHandler(async (req, res) => {
  const channel = await prisma.channel.findUnique({
    where: { id: req.params.id },
    include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' }, take: 1 } },
  });
  if (!channel) return error(res, 'Channel not found', 404);
  if (!channel.streams.length) return error(res, 'No active stream available', 503);

  // Check subscription
  if (channel.isPremium) {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: 'ACTIVE', expiresAt: { gt: new Date() } },
    });
    if (!sub) return error(res, 'Active subscription required', 403);
  }

  success(res, { url: channel.streams[0].url, type: channel.streams[0].streamType });
});

exports.createChannel = asyncHandler(async (req, res) => {
  const channel = await prisma.channel.create({ data: req.body });
  success(res, { channel }, 'Channel created', 201);
});

exports.updateChannel = asyncHandler(async (req, res) => {
  const channel = await prisma.channel.update({ where: { id: req.params.id }, data: req.body });
  success(res, { channel });
});

exports.deleteChannel = asyncHandler(async (req, res) => {
  await prisma.channel.delete({ where: { id: req.params.id } });
  success(res, null, 'Channel deleted');
});

exports.bulkImport = asyncHandler(async (req, res) => {
  const { channels } = req.body;
  const result = await prisma.channel.createMany({ data: channels, skipDuplicates: true });
  success(res, { count: result.count }, `${result.count} channels imported`, 201);
});
