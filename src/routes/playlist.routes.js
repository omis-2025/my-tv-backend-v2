const router = require('express').Router();
const playlistController = require('../controllers/playlist.controller');

// Token-authenticated via query string (no Bearer header) so IPTV players can
// load it directly as a URL. Intentionally NOT behind `authenticate`.
router.get('/playlist.m3u', playlistController.getPlaylist);

module.exports = router;
