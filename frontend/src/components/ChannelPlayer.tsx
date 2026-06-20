'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Hls from 'hls.js';
import api from '@/lib/api';

interface Channel { id: string; name: string; category: string; isPremium: boolean }

type State =
  | { kind: 'loading' }
  | { kind: 'playing'; url: string; type: string }
  | { kind: 'no-stream' }
  | { kind: 'needs-subscription' }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

export default function ChannelPlayer({ channel, onClose }: { channel: Channel; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<State>({ kind: 'loading' });

  // Resolve the playable stream URL for this channel.
  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    api.get(`/channels/${channel.id}/stream`)
      .then(({ data }) => {
        if (cancelled) return;
        const { url, type } = data.data;
        setState({ kind: 'playing', url, type });
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 403) setState({ kind: 'needs-subscription' });
        else if (status === 503) setState({ kind: 'no-stream' });
        else if (status === 404) setState({ kind: 'not-found' });
        else setState({ kind: 'error', message: err.response?.data?.message || 'Could not load this stream.' });
      });
    return () => { cancelled = true; };
  }, [channel.id]);

  // Attach the stream to the <video> element once we have a URL. HLS is played
  // via hls.js where MSE is supported, falling back to native playback (Safari).
  useEffect(() => {
    if (state.kind !== 'playing') return;
    const video = videoRef.current;
    if (!video) return;

    const isHls = state.type?.toUpperCase() === 'HLS' || state.url.includes('.m3u8');
    let hls: Hls | null = null;

    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(state.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setState({ kind: 'error', message: 'Playback failed — the stream may be offline.' });
        }
      });
    } else {
      // Native (Safari HLS) or progressive MP4.
      video.src = state.url;
      video.play().catch(() => {});
    }

    return () => { if (hls) hls.destroy(); };
  }, [state]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="live-pulse w-2 h-2 rounded-full inline-block" style={{ background: '#ef4444' }} />
            <div>
              <h3 className="font-bold leading-tight">{channel.name}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{channel.category}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}>✕</button>
        </div>

        {/* Body */}
        <div className="relative bg-black" style={{ aspectRatio: '16 / 9' }}>
          {state.kind === 'playing' ? (
            <video ref={videoRef} controls autoPlay playsInline className="w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              {state.kind === 'loading' && (
                <>
                  <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                  <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>Connecting to stream…</p>
                </>
              )}
              {state.kind === 'needs-subscription' && (
                <>
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="font-bold mb-1">Subscription required</p>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                    {channel.name} is a premium channel. Upgrade your plan to watch.
                  </p>
                  <Link href="/subscribe"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 transition-colors text-white">
                    View Plans
                  </Link>
                </>
              )}
              {state.kind === 'no-stream' && (
                <>
                  <p className="text-4xl mb-3">📡</p>
                  <p className="font-bold mb-1">No stream available</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    This channel doesn’t have an active stream right now. Please try again later.
                  </p>
                </>
              )}
              {state.kind === 'not-found' && (
                <>
                  <p className="text-4xl mb-3">❓</p>
                  <p className="font-bold mb-1">Channel not found</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This channel is no longer available.</p>
                </>
              )}
              {state.kind === 'error' && (
                <>
                  <p className="text-4xl mb-3">⚠️</p>
                  <p className="font-bold mb-1">Playback error</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{state.message}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
