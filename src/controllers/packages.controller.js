const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error } = require('../utils/response');

exports.listPackages = asyncHandler(async (req, res) => {
  const packages = await prisma.package.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
  success(res, { packages });
});

exports.getPackage = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!pkg) return error(res, 'Package not found', 404);
  success(res, { package: pkg });
});

exports.createPackage = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.create({ data: req.body });
  success(res, { package: pkg }, 'Package created', 201);
});

exports.updatePackage = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.update({ where: { id: req.params.id }, data: req.body });
  success(res, { package: pkg });
});

exports.deletePackage = asyncHandler(async (req, res) => {
  await prisma.package.delete({ where: { id: req.params.id } });
  success(res, null, 'Package deleted');
});
