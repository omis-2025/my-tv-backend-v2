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

// Probe a stream URL to determine whether it is currently reachable. Uses a
// short timeout and the stream's custom userAgent/referer headers if set. For
// HLS we fetch the manifest and confirm it looks like one; for other types a
// successful response status is sufficient.
async function probeStream(stream, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {};
  if (stream.userAgent) headers['User-Agent'] = stream.userAgent;
  if (stream.referer) headers['Referer'] = stream.referer;
  if (stream.headers && typeof stream.headers === 'object') Object.assign(headers, stream.headers);

  const result = { id: stream.id, url: stream.url, healthy: false, status: null, error: null, checkedAt: new Date() };
  try {
    const resp = await fetch(stream.url, { method: 'GET', headers, signal: controller.signal, redirect: 'follow' });
    result.status = resp.status;
    if (!resp.ok) {
      result.error = `HTTP ${resp.status}`;
    } else if (String(stream.streamType).toUpperCase() === 'HLS') {
      const text = (await resp.text()).slice(0, 2048);
      result.healthy = text.includes('#EXTM3U');
      if (!result.healthy) result.error = 'Response is not a valid HLS manifest';
    } else {
      result.healthy = true;
    }
  } catch (err) {
    result.error = err.name === 'AbortError' ? 'Timed out' : err.message;
  } finally {
    clearTimeout(timer);
  }
  return result;
}

exports.checkHealth = asyncHandler(async (req, res) => {
  const stream = await prisma.stream.findUnique({ where: { id: req.params.id } });
  if (!stream) return error(res, 'Stream not found', 404);
  const result = await probeStream(stream);
  success(res, result);
});

// POST /streams/health-check  { streamIds?: [], channelId?, onlyActive? }
// Probes a batch of streams concurrently and reports health. Optionally
// auto-disables streams that fail when `disableBroken` is true.
exports.bulkHealthCheck = asyncHandler(async (req, res) => {
  const { streamIds, channelId, disableBroken = false } = req.body || {};
  const where = {
    ...(Array.isArray(streamIds) && streamIds.length && { id: { in: streamIds } }),
    ...(channelId && { channelId }),
  };
  const streams = await prisma.stream.findMany({ where, take: 200 });
  if (!streams.length) return error(res, 'No streams matched', 404);

  // Probe in bounded-concurrency batches to avoid opening hundreds of sockets.
  const results = [];
  const batchSize = 10;
  for (let i = 0; i < streams.length; i += batchSize) {
    const batch = streams.slice(i, i + batchSize);
    results.push(...await Promise.all(batch.map((s) => probeStream(s))));
  }

  let disabled = 0;
  if (disableBroken) {
    const brokenIds = results.filter((r) => !r.healthy).map((r) => r.id);
    if (brokenIds.length) {
      const upd = await prisma.stream.updateMany({ where: { id: { in: brokenIds } }, data: { isActive: false } });
      disabled = upd.count;
    }
  }

  const healthy = results.filter((r) => r.healthy).length;
  success(res, { total: results.length, healthy, broken: results.length - healthy, disabled, results });
});

// POST /streams/import-csv  { csv: "channelId,channelName,url,streamType,priority\n..." }
// Each row attaches a stream to an existing channel, matched by channelId or
// (failing that) by exact channelName. Returns per-row results.
exports.importCsv = asyncHandler(async (req, res) => {
  const { csv } = req.body || {};
  if (typeof csv !== 'string' || !csv.trim()) return error(res, 'csv (string) is required', 400);

  const rows = parseCsv(csv);
  if (!rows.length) return error(res, 'CSV has no data rows', 400);

  const created = [];
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNo = i + 2; // account for header line
    try {
      const url = (row.url || '').trim();
      if (!url) { errors.push({ line: lineNo, error: 'Missing url' }); continue; }

      let channel = null;
      if (row.channelid) {
        channel = await prisma.channel.findUnique({ where: { id: row.channelid.trim() } });
      } else if (row.channelname) {
        channel = await prisma.channel.findFirst({ where: { name: { equals: row.channelname.trim(), mode: 'insensitive' } } });
      }
      if (!channel) { errors.push({ line: lineNo, error: 'Channel not found' }); continue; }

      const streamType = (row.streamtype || 'HLS').trim().toUpperCase();
      if (!['HLS', 'DASH', 'RTMP', 'MP4'].includes(streamType)) {
        errors.push({ line: lineNo, error: `Invalid streamType "${streamType}"` });
        continue;
      }
      const priority = row.priority ? parseInt(row.priority, 10) || 0 : 0;

      const stream = await prisma.stream.create({
        data: { channelId: channel.id, url, streamType, priority },
      });
      created.push({ line: lineNo, streamId: stream.id, channel: channel.name });
    } catch (err) {
      errors.push({ line: lineNo, error: err.message });
    }
  }

  success(res, { created: created.length, failed: errors.length, results: created, errors }, `${created.length} stream(s) imported`, 201);
});

// POST /streams/bulk-update  { updates: [{ id, isActive?, priority?, url?, streamType?, ... }] }
exports.bulkUpdate = asyncHandler(async (req, res) => {
  const { updates } = req.body || {};
  if (!Array.isArray(updates) || !updates.length) return error(res, 'updates (non-empty array) is required', 400);

  const updated = [];
  const errors = [];
  for (const u of updates) {
    if (!u || !u.id) { errors.push({ id: u && u.id, error: 'Missing id' }); continue; }
    const data = pick(u, STREAM_FIELDS);
    if (!Object.keys(data).length) { errors.push({ id: u.id, error: 'No updatable fields' }); continue; }
    try {
      await prisma.stream.update({ where: { id: u.id }, data });
      updated.push(u.id);
    } catch (err) {
      errors.push({ id: u.id, error: err.code === 'P2025' ? 'Stream not found' : err.message });
    }
  }
  success(res, { updated: updated.length, failed: errors.length, updatedIds: updated, errors });
});

// Minimal CSV parser: handles a header row, comma separators, and double-quoted
// fields (with "" escaping). Keys are lowercased for case-insensitive headers.
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] !== undefined ? cells[idx] : ''; });
    return obj;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
      } else { cur += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      out.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

exports.resolveStream = asyncHandler(async (req, res) => {
  const stream = await prisma.stream.findUnique({ where: { id: req.params.id } });
  if (!stream || !stream.isActive) return error(res, 'Stream not available', 404);
  success(res, { url: stream.url, type: stream.streamType });
});
