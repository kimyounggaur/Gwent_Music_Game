import type { AudioPrompt } from "@/cadenza/types";

type ToneModule = typeof import("tone");

let tonePromise: Promise<ToneModule> | null = null;
let volume = -10;
let playing = false;

async function getTone(): Promise<ToneModule> {
  if (!tonePromise) tonePromise = import("tone");
  const Tone = await tonePromise;
  await Tone.start();
  Tone.Destination.volume.value = volume;
  return Tone;
}

function midiToNote(midi: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  return `${notes[midi % 12]}${octave}`;
}

export function setMasterVolume(db: number): void {
  volume = db;
  void tonePromise?.then((Tone) => {
    Tone.Destination.volume.value = db;
  });
}

export function isPlaying(): boolean {
  return playing;
}

export async function stopAll(): Promise<void> {
  const Tone = await getTone();
  Tone.Transport.stop();
  Tone.Transport.cancel();
  playing = false;
}

export async function playInterval(rootMidi: number, semitones: number, mode: "melodic" | "harmonic" = "melodic"): Promise<void> {
  const Tone = await getTone();
  await stopAll();
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.4 }
  }).toDestination();
  playing = true;
  const root = midiToNote(rootMidi);
  const top = midiToNote(rootMidi + semitones);
  if (mode === "harmonic") synth.triggerAttackRelease([root, top], "1n");
  else {
    synth.triggerAttackRelease(root, "4n");
    synth.triggerAttackRelease(top, "4n", "+0.6");
  }
  window.setTimeout(() => {
    synth.dispose();
    playing = false;
  }, 1500);
}

export async function playChord(rootMidi: number, quality: NonNullable<AudioPrompt["quality"]> = "maj"): Promise<void> {
  const Tone = await getTone();
  await stopAll();
  const intervals: Record<string, number[]> = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    dom7: [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    C9: [0, 4, 7, 10, 14],
    sus4: [0, 5, 7]
  };
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.08, sustain: 0.25, release: 0.55 }
  }).toDestination();
  playing = true;
  synth.triggerAttackRelease(intervals[quality].map((interval) => midiToNote(rootMidi + interval)), "1n");
  window.setTimeout(() => {
    synth.dispose();
    playing = false;
  }, 1600);
}

export async function playRhythm(pattern: NonNullable<AudioPrompt["pattern"]>, bpm = 90): Promise<void> {
  const Tone = await getTone();
  await stopAll();
  Tone.Transport.bpm.value = bpm;
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.16, sustain: 0 }
  }).toDestination();
  let time = 0;
  const durationSeconds: Record<string, number> = { "4n": 0.55, "8n": 0.28, "8t": 0.19, "4n.": 0.82, "16n": 0.14 };
  pattern.forEach((step, index) => {
    Tone.Transport.scheduleOnce((scheduled) => {
      if (!step.rest) synth.triggerAttackRelease(index === 0 ? "C3" : "G2", "16n", scheduled);
    }, time);
    time += durationSeconds[step.dur];
  });
  playing = true;
  Tone.Transport.start();
  window.setTimeout(() => {
    void stopAll();
    synth.dispose();
  }, (time + 0.4) * 1000);
}

export async function playAudioPrompt(audio: AudioPrompt): Promise<void> {
  if (audio.type === "interval") return playInterval(audio.rootMidi ?? 60, audio.semitones ?? 4, audio.mode ?? "melodic");
  if (audio.type === "chord") return playChord(audio.rootMidi ?? 60, audio.quality ?? "maj");
  return playRhythm(audio.pattern ?? [{ dur: "4n" }], audio.bpm ?? 90);
}
