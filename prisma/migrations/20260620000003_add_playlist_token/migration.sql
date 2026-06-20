-- Add per-user playlist token for IPTV (M3U) URL-based authentication
ALTER TABLE "users" ADD COLUMN "playlistToken" TEXT;
CREATE UNIQUE INDEX "users_playlistToken_key" ON "users"("playlistToken");
