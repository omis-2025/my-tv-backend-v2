const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, paginated } = require('../utils/response');

exports.getEPG = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 100 } = req.query;
  const skip = (page - 1) * limit;
  const start = date ? new Date(date) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [entries, total] = await Promise.all([
    prisma.epgEntry.findMany({
      where: { startTime: { gte: start, lt: end } },
      skip, take: +limit,
      include: { channel: { select: { id: true, name: true, logo: true } } },
      orderBy: { startTime: 'asc' },
    }),
    prisma.epgEntry.count({ where: { startTime: { gte: start, lt: end } } }),
  ]);
  paginated(res, entries, { page: +page, limit: +limit, total });
});

exports.getChannelEPG = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const start = date ? new Date(date) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const entries = await prisma.epgEntry.findMany({
    where: { channelId: req.params.channelId, startTime: { gte: start, lt: end } },
    orderBy: { startTime: 'asc' },
  });
  success(res, { entries });
});

exports.getNowPlaying = asyncHandler(async (req, res) => {
  const now = new Date();
  const entries = await prisma.epgEntry.findMany({
    where: { startTime: { lte: now }, endTime: { gt: now } },
    include: { channel: { select: { id: true, name: true, logo: true } } },
  });
  success(res, { entries });
});

exports.syncEPG = asyncHandler(async (req, res) => {
  // Placeholder for EPG XML/XMLTV sync implementation
  success(res, null, 'EPG sync triggered');
});

exports.createEntry = asyncHandler(async (req, res) => {
  const entry = await prisma.epgEntry.create({ data: req.body });
  success(res, { entry }, 'EPG entry created', 201);
});

exports.updateEntry = asyncHandler(async (req, res) => {
  const entry = await prisma.epgEntry.update({ where: { id: req.params.id }, data: req.body });
  success(res, { entry });
});

exports.deleteEntry = asyncHandler(async (req, res) => {
  await prisma.epgEntry.delete({ where: { id: req.params.id } });
  success(res, null, 'EPG entry deleted');
});
