#!/usr/bin/env node
/**
 * Generates the two audio assets the alarm needs. Committed output, but kept
 * as a script so the tone can be tuned without hunting for a sample pack.
 *
 *   assets/audio/alarm.wav    10 s seamless loop, deliberately unpleasant
 *   assets/audio/silence.wav  1 s near-silence for the iOS keep-alive session
 *
 * Run: node scripts/make-audio.js
 */

const fs = require('node:fs');
const path = require('node:path');

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const dataLength = samples.length * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataLength);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  console.log(
    `wrote ${filePath} (${(buffer.length / 1024).toFixed(1)} KB, ` +
      `${(samples.length / SAMPLE_RATE).toFixed(1)}s)`,
  );
}

/**
 * A two-tone klaxon with a hard tremolo.
 *
 * Design notes, since "make a loud noise" underspecifies the problem:
 *  - Alternating pitches beat a steady tone; the auditory system habituates to
 *    constant stimuli, which is exactly what we cannot afford.
 *  - Odd harmonics (a softened square wave) put energy in the 2–4 kHz band
 *    where hearing is most sensitive and where phone speakers are loudest.
 *  - The 8 Hz tremolo adds roughness. It is genuinely irritating, which is the
 *    entire design goal.
 *  - Total length divides evenly into the tone period so the loop is seamless.
 */
function buildAlarm(durationSec = 10) {
  const n = Math.floor(SAMPLE_RATE * durationSec);
  const samples = new Float32Array(n);

  const toneA = 880;
  const toneB = 622.25;
  const switchPeriod = 0.5; // seconds per tone
  const tremoloHz = 8;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const useA = Math.floor(t / switchPeriod) % 2 === 0;
    const f = useA ? toneA : toneB;

    // Softened square: fundamental plus decaying odd harmonics.
    let v = 0;
    for (const [mult, gain] of [
      [1, 1.0],
      [3, 0.34],
      [5, 0.2],
      [7, 0.12],
    ]) {
      v += Math.sin(2 * Math.PI * f * mult * t) * gain;
    }
    v /= 1.66;

    // Tremolo: never fully closes, so the alarm is continuous, not beeping.
    const tremolo = 0.72 + 0.28 * Math.sin(2 * Math.PI * tremoloHz * t);

    // Short fade across each tone switch to avoid a click.
    const intoTone = t % switchPeriod;
    const edge = Math.min(intoTone, switchPeriod - intoTone);
    const declick = Math.min(1, edge / 0.005);

    samples[i] = v * tremolo * declick * 0.92;
  }

  return samples;
}

/**
 * Near-silence rather than true digital silence: some audio stacks treat an
 * all-zero buffer as an idle session and let it be culled, which would defeat
 * the point of holding the session open.
 */
function buildSilence(durationSec = 1) {
  const n = Math.floor(SAMPLE_RATE * durationSec);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    // ~-90 dBFS. Inaudible, but not zero.
    samples[i] = Math.sin(2 * Math.PI * 60 * (i / SAMPLE_RATE)) * 0.00003;
  }
  return samples;
}

const outDir = path.join(__dirname, '..', 'assets', 'audio');
writeWav(path.join(outDir, 'alarm.wav'), buildAlarm(10));
writeWav(path.join(outDir, 'silence.wav'), buildSilence(1));
