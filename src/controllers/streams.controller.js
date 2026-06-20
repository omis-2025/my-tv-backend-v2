const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error, paginated } = require('../utils/response');

// Only these fields may be written from client input.
const STREAM_FIELDS = ['channelId', 'url', 'streamType', 'priority', 'isActive', 'userAgent', 'referer', 'headers'];
const pick = (src, fields) => fields.reduce((acc, f) => {
  if (src[f] !== undefined) acc[f] = src[f];
  return acc;
}, {});

exports.listStreams = asyncHandler(async (req, res) => {
  const { channelId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const where = { ...(channelId && { channelId }) };
  const [streams, total] = await Promise.all([
    prisma.stream.findMany({ where, skip, take: +limit, include: { channel: { select: { name: true } } } }),
    prisma.stream.count({ where }),
  ]);
  paginated(res, streams, { page: +page, limit: +limit, total });
});

exports.createStream = asyncHandler(async (req, res) => {
  const stream = await prisma.stream.create({ data: pick(req.body, STREAM_FIELDS) });
  success(res, { stream }, 'Stream created', 201);
});

exports.updateStream = asyncHandler(async (req, res) => {
  const stream = await prisma.stream.update({ where: { id: req.params.id }, data: pick(req.body, STREAM_FIELDS) });
  success(res, { stream });
});

exports.deleteStream = asyncHandler(async (req, res) => {
  await prisma.stream.delete({ where: { id: req.params.id } });
  success(res, null, 'Stream deleted');
});

exports.checkHealth = asyncHandler(async (req, res) => {
  const stream = await prisma.stream.findUnique({ where: { id: req.params.id } });
  if (!stream) return error(res, 'Stream not found', 404);
  // Placeholder — real implementation would probe the URL
  success(res, { id: stream.id, url: stream.url, healthy: true, checkedAt: new Date() });
});

exports.resolveStream = asyncHandler(async (req, res) => {
  const stream = await prisma.stream.findUnique({ where: { id: req.params.id } });
  if (!stream || !stream.isActive) return error(res, 'Stream not available', 404);
  success(res, { url: stream.url, type: stream.streamType });
});
