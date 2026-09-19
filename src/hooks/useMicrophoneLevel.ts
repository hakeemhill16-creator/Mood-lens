import { useCallback, useEffect, useRef, useState } from 'react'

/** A local analyser for visual reactivity; raw microphone audio never leaves the device. */
export function useMicrophoneLevel() {
  const [level, setLevel] = useState(0); const context = useRef<AudioContext | null>(null); const stream = useRef<MediaStream | null>(null); const frame = useRef<number | null>(null)
  const stop = useCallback(() => { if (frame.current) cancelAnimationFrame(frame.current); stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; context.current?.close(); context.current = null; setLevel(0) }, [])
  const start = useCallback(async () => {
    try {
      stop(); const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true }); const audioContext = new AudioContext(); const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256; audioContext.createMediaStreamSource(mediaStream).connect(analyser); stream.current = mediaStream; context.current = audioContext; const data = new Uint8Array(analyser.frequencyBinCount)
      const sample = () => { analyser.getByteTimeDomainData(data); let sum = 0; data.forEach(value => { const n = (value - 128) / 128; sum += n * n }); setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4.5)); frame.current = requestAnimationFrame(sample) }; sample()
      return true
    } catch { return false }
  }, [stop])
  useEffect(() => stop, [stop]); return { level, start, stop }
}
