// ============================================================
// ExcelTutor AI — Shared Audio Context Manager
// ============================================================
// Menyediakan AudioContext tunggal + MediaStreamAudioDestination
// agar audio yang dimainkan juga tertangkap oleh MediaRecorder.
// ============================================================

let ctx: AudioContext | null = null;
let dest: MediaStreamAudioDestinationNode | null = null;
let gain: GainNode | null = null;

/** Initialize atau return existing AudioContext + destination stream */
export function getAudioContext(): { ctx: AudioContext; dest: MediaStreamAudioDestinationNode } {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
    dest = ctx.createMediaStreamDestination();
    gain = ctx.createGain();
    gain.gain.value = 0.8;
    gain.connect(dest);   // juga ke speaker
    gain.connect(ctx.destination); // speaker output
  }
  return { ctx, dest: dest! };
}

/** Dapatkan combined stream (canvas video + audio) untuk recording */
export function getCombinedRecordingStream(
  canvas: HTMLCanvasElement,
  fps: number = 30
): MediaStream | null {
  try {
    const videoStream = canvas.captureStream(fps);

    // Hentikan dulu karena captureStream membuat semua track paused
    videoStream.getVideoTracks().forEach((t) => (t.enabled = true));

    const { dest: audioDest } = getAudioContext();
    const audioTrack = audioDest.stream.getAudioTracks()[0];
    if (audioTrack) {
      videoStream.addTrack(audioTrack);
    }
    return videoStream;
  } catch {
    // Fallback: video only
    return canvas.captureStream(fps);
  }
}

/**
 * Play audio dari URL melewati AudioContext agar ikut ke stream rekaman.
 * Returns promise resolve dengan durasi (ms) setelah selesai.
 */
export async function playAudioThroughContext(url: string): Promise<number> {
  const { ctx } = getAudioContext();
  if (!gain) {
    getAudioContext();
  }

  try {
    // Fetch audio
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await ctx.decodeAudioData(buffer);
    } catch {
      // Coba ulang sekali
      await new Promise((r) => setTimeout(r, 100));
      audioBuffer = await ctx.decodeAudioData(buffer);
    }

    // Play melalui buffer source → gain → destination + speaker
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gain!);

    return new Promise<number>((resolve) => {
      const durationMs = Math.round(audioBuffer.duration * 1000);
      source.onended = () => resolve(durationMs);
      source.start(0);
    });
  } catch {
    // Audio gagal — return fallback duration
    return 3000;
  }
}

/** Close/reset context */
export function closeAudioContext() {
  if (ctx && ctx.state !== 'closed') {
    ctx.close().catch(() => {});
  }
  ctx = null;
  dest = null;
  gain = null;
}
