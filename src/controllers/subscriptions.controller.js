const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error, paginated } = require('../utils/response');

exports.getMySubscription = asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.findFirst({
    where: { userId: req.user.id },
    include: { package: true },
    orderBy: { createdAt: 'desc' },
  });
  success(res, { subscription: sub });
});

exports.subscribe = asyncHandler(async (req, res) => {
  const { packageId } = req.body;
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) return error(res, 'Package not found', 404);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

  // Deactivate existing
  await prisma.subscription.updateMany({
    where: { userId: req.user.id, status: 'ACTIVE' },
    data: { status: 'CANCELLED' },
  });

  const sub = await prisma.subscription.create({
    data: { userId: req.user.id, packageId, expiresAt, status: 'ACTIVE' },
    include: { package: true },
  });
  success(res, { subscription: sub }, 'Subscribed successfully', 201);
});

exports.cancel = asyncHandler(async (req, res) => {
  await prisma.subscription.updateMany({
    where: { userId: req.user.id, status: 'ACTIVE' },
    data: { status: 'CANCELLED' },
  });
  success(res, null, 'Subscription cancelled');
});

exports.listAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;
  const where = { ...(status && { status }) };
  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({ where, skip, take: +limit, include: { user: { select: { email: true, name: true } }, package: true }, orderBy: { createdAt: 'desc' } }),
    prisma.subscription.count({ where }),
  ]);
  paginated(res, subs, { page: +page, limit: +limit, total });
});

exports.assignToUser = asyncHandler(async (req, res) => {
  const { userId, packageId, expiresAt } = req.body;
  const sub = await prisma.subscription.create({
    data: { userId, packageId, expiresAt: new Date(expiresAt), status: 'ACTIVE' },
  });
  success(res, { sub }, 'Subscription assigned', 201);
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.update({ where: { id: req.params.id }, data: req.body });
  success(res, { sub });
});

exports.deleteSubscription = asyncHandler(async (req, res) => {
  await prisma.subscription.delete({ where: { id: req.params.id } });
  success(res, null, 'Subscription deleted');
});
