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

  // SECURITY: This endpoint activates a subscription WITHOUT payment, so it
  // must ONLY be usable for free plans. Paid plans (price > 0) must go through
  // Stripe checkout and be activated by the verified webhook only.
  if (pkg.price > 0) {
    return error(res, 'Paid plans require checkout. Please use the payment flow to subscribe.', 402);
  }

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
  const [user, pkg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.package.findUnique({ where: { id: packageId } }),
  ]);
  if (!user) return error(res, 'User not found', 404);
  if (!pkg) return error(res, 'Package not found', 404);

  const sub = await prisma.subscription.create({
    data: { userId, packageId, expiresAt: new Date(expiresAt), status: 'ACTIVE' },
  });
  success(res, { sub }, 'Subscription assigned', 201);
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  // Whitelist mutable fields — never pass req.body straight to the DB.
  const { status, expiresAt } = req.body;
  const data = {};
  if (status !== undefined) data.status = status;
  if (expiresAt !== undefined) data.expiresAt = new Date(expiresAt);

  const sub = await prisma.subscription.update({ where: { id: req.params.id }, data });
  success(res, { sub });
});

exports.deleteSubscription = asyncHandler(async (req, res) => {
  await prisma.subscription.delete({ where: { id: req.params.id } });
  success(res, null, 'Subscription deleted');
});
