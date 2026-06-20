const crypto = require('crypto');
const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error } = require('../utils/response');

// Returns true if the given user (may be null) currently holds an ACTIVE,
// non-expired subscription. Premium channels require this; free channels never do.
async function hasActiveSubscription(userId) {
  if (!userId) return false;
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
  });
  return !!sub;
}

// Builds the set of channels (with their best active stream) that a user may
// play: all free channels with a stream, plus premium channels only when the
// user has an active subscription.
async function getAccessibleChannels(userId) {
  const premiumAllowed = await hasActiveSubscription(userId);
  const channels = await prisma.channel.findMany({
    where: {
      isActive: true,
      ...(premiumAllowed ? {} : { isPremium: false }),
      streams: { some: { isActive: true } },
    },
    orderBy: { sortOrder: 'asc' },
    include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' }, take: 1 } },
  });
  return channels;
}

function escapeExtinf(value) {
  return String(value || '').replace(/[\r\n"]/g, ' ').trim();
}

function buildM3U(channels) {
  const lines = ['#EXTM3U'];
  for (const ch of channels) {
    const stream = ch.streams[0];
    if (!stream) continue;
    const attrs = [
      `tvg-id="${escapeExtinf(ch.id)}"`,
      `tvg-name="${escapeExtinf(ch.name)}"`,
      ch.logo ? `tvg-logo="${escapeExtinf(ch.logo)}"` : '',
      `group-title="${escapeExtinf(ch.category)}"`,
    ].filter(Boolean).join(' ');
    lines.push(`#EXTINF:-1 ${attrs},${escapeExtinf(ch.name)}`);
    lines.push(stream.url);
  }
  return lines.join('\n') + '\n';
}

// GET /users/playlist-token  (authenticated) — returns the user's playlist token
// and the ready-to-use M3U URL, generating the token on first request.
exports.getPlaylistToken = asyncHandler(async (req, res) => {
  let token = req.user.playlistToken;
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    await prisma.user.update({ where: { id: req.user.id }, data: { playlistToken: token } });
  }
  const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}/api/v1`;
  success(res, { token, url: `${base}/playlist.m3u?token=${token}` });
});

// POST /users/playlist-token/rotate (authenticated) — issues a new token,
// invalidating the previous M3U URL (use if a URL leaks).
exports.rotatePlaylistToken = asyncHandler(async (req, res) => {
  const token = crypto.randomBytes(24).toString('hex');
  await prisma.user.update({ where: { id: req.user.id }, data: { playlistToken: token } });
  const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}/api/v1`;
  success(res, { token, url: `${base}/playlist.m3u?token=${token}` }, 'Playlist token rotated');
});

// GET /playlist.m3u?token=... — public route, authenticated by the playlist
// token in the query string so IPTV clients (VLC, TiViMate, IPTV Smarters)
// can load it directly as a URL. Returns an M3U of accessible channels.
exports.getPlaylist = asyncHandler(async (req, res) => {
  const token = req.query.token;
  if (!token) return error(res, 'Playlist token required', 401);

  const user = await prisma.user.findUnique({ where: { playlistToken: token } });
  if (!user || !user.isActive) return error(res, 'Invalid playlist token', 401);

  const channels = await getAccessibleChannels(user.id);
  const body = buildM3U(channels);

  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u"');
  res.send(body);
});

exports._internal = { getAccessibleChannels, buildM3U, hasActiveSubscription };
