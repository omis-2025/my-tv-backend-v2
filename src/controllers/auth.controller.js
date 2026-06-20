const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error } = require('../utils/response');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

exports.register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return error(res, 'Email already in use', 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const token = signToken(user.id);
  const refreshToken = signRefresh(user.id);
  success(res, { user, token, refreshToken }, 'Account created', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return error(res, 'Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return error(res, 'Invalid credentials', 401);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { password: _, ...safeUser } = user;
  const token = signToken(user.id);
  const refreshToken = signRefresh(user.id);
  success(res, { user: safeUser, token, refreshToken });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return error(res, 'Refresh token required', 400);

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const token = signToken(decoded.id);
    success(res, { token });
  } catch {
    error(res, 'Invalid refresh token', 401);
  }
});

exports.logout = asyncHandler(async (req, res) => {
  success(res, null, 'Logged out successfully');
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to avoid user enumeration
  if (user) {
    const token = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600000) },
    });
    // TODO: send email with reset link
  }
  success(res, null, 'If this email exists, a reset link has been sent');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) return error(res, 'Invalid or expired reset token', 400);

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });
  success(res, null, 'Password reset successful');
});

exports.getMe = asyncHandler(async (req, res) => {
  const { password, ...safeUser } = req.user;
  success(res, { user: safeUser });
});
