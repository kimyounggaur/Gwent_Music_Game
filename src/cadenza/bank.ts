import type { Challenge } from "./types";

type SeedChallenge = Omit<Challenge, "ref">;

export const CHALLENGE_BANK: SeedChallenge[] = [
  { id: "mc-interval-maj3", kind: "theory_mc", tier: 1, prompt: "장3도는 반음 몇 개로 이루어질까요?", options: ["3", "4", "5", "7"], correctIndex: 1, explanation: "장3도는 반음 4개입니다.", conceptTag: "interval" },
  { id: "mc-interval-min3", kind: "theory_mc", tier: 1, prompt: "단3도는 반음 몇 개일까요?", options: ["2", "3", "4", "5"], correctIndex: 1, explanation: "단3도는 반음 3개입니다.", conceptTag: "interval" },
  { id: "mc-perfect5", kind: "theory_mc", tier: 1, prompt: "완전5도는 반음 몇 개일까요?", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "완전5도는 반음 7개입니다.", conceptTag: "interval" },
  { id: "mc-dotted", kind: "theory_mc", tier: 1, prompt: "점4분음표는 8분음표 몇 개 길이일까요?", options: ["2", "3", "4", "6"], correctIndex: 1, explanation: "점은 원래 길이의 절반을 더합니다.", conceptTag: "rhythm" },
  { id: "mc-tonic", kind: "theory_mc", tier: 1, prompt: "C장조의 으뜸화음은?", options: ["C-E-G", "D-F-A", "G-B-D", "F-A-C"], correctIndex: 0, explanation: "C장조 I화음은 C-E-G입니다.", conceptTag: "chord" },
  { id: "mc-dominant", kind: "theory_mc", tier: 1, prompt: "C장조의 딸림음은?", options: ["C", "F", "G", "B"], correctIndex: 2, explanation: "다섯 번째 음 G가 딸림음입니다.", conceptTag: "cadence" },
  { id: "mc-triplet", kind: "theory_mc", tier: 2, prompt: "셋잇단음표는 보통 같은 시간 안에 몇 음을 넣나요?", options: ["2", "3", "4", "5"], correctIndex: 1, explanation: "셋잇단음표는 둘의 공간에 셋을 넣는 느낌입니다.", conceptTag: "rhythm" },
  { id: "mc-sus4", kind: "theory_mc", tier: 2, prompt: "sus4 화음에서 3음은 무엇으로 대체되나요?", options: ["2도", "4도", "6도", "7도"], correctIndex: 1, explanation: "sus4는 3음을 4도로 매다는 화음입니다.", conceptTag: "chord" },
  { id: "build-c-major", kind: "theory_build", tier: 1, prompt: "C장조 음계를 순서대로 고르세요.", options: ["C", "D", "E", "F", "G", "A", "B"], correctIndex: 0, explanation: "C장조는 C-D-E-F-G-A-B입니다.", conceptTag: "scale" },
  { id: "build-c-triad", kind: "theory_build", tier: 1, prompt: "C장3화음의 구성음을 고르세요.", options: ["C", "E", "G", "B", "D"], correctIndex: 0, explanation: "C장3화음은 C-E-G입니다.", conceptTag: "chord" },
  { id: "build-g7", kind: "theory_build", tier: 2, prompt: "G7의 구성음을 고르세요.", options: ["G", "B", "D", "F", "A"], correctIndex: 0, explanation: "G7은 G-B-D-F입니다.", conceptTag: "cadence" },
  { id: "build-a-minor", kind: "theory_build", tier: 2, prompt: "A단음계 자연단음계를 고르세요.", options: ["A", "B", "C", "D", "E", "F", "G"], correctIndex: 0, explanation: "A natural minor는 A-B-C-D-E-F-G입니다.", conceptTag: "scale" },
  { id: "build-dim", kind: "theory_build", tier: 2, prompt: "감3화음의 음정 구조는?", options: ["단3도+단3도", "장3도+단3도", "단3도+장3도", "장3도+장3도"], correctIndex: 0, explanation: "감3화음은 단3도 두 개가 쌓입니다.", conceptTag: "chord" },
  { id: "ear-maj3", kind: "ear_interval", tier: 1, prompt: "재생된 음정은?", options: ["장3도", "단3도", "완전5도", "장2도"], correctIndex: 0, explanation: "밝게 벌어지는 장3도입니다.", conceptTag: "interval", audio: { type: "interval", rootMidi: 60, semitones: 4, mode: "melodic" } },
  { id: "ear-min3", kind: "ear_interval", tier: 1, prompt: "재생된 음정은?", options: ["장3도", "단3도", "완전5도", "단2도"], correctIndex: 1, explanation: "조금 어두운 단3도입니다.", conceptTag: "interval", audio: { type: "interval", rootMidi: 60, semitones: 3, mode: "melodic" } },
  { id: "ear-p5", kind: "ear_interval", tier: 2, prompt: "재생된 음정은?", options: ["완전4도", "완전5도", "장6도", "감5도"], correctIndex: 1, explanation: "안정적인 완전5도입니다.", conceptTag: "interval", audio: { type: "interval", rootMidi: 60, semitones: 7, mode: "harmonic" } },
  { id: "ear-chord-maj", kind: "ear_chord", tier: 1, prompt: "재생된 화음은?", options: ["장화음", "단화음"], correctIndex: 0, explanation: "밝은 장3도가 포함된 장화음입니다.", conceptTag: "chord", audio: { type: "chord", rootMidi: 60, quality: "maj" } },
  { id: "ear-chord-min", kind: "ear_chord", tier: 1, prompt: "재생된 화음은?", options: ["장화음", "단화음"], correctIndex: 1, explanation: "단3도를 가진 단화음입니다.", conceptTag: "chord", audio: { type: "chord", rootMidi: 60, quality: "min" } },
  { id: "ear-chord-c9", kind: "ear_chord", tier: 3, prompt: "재생된 텐션 화음은?", options: ["C9", "sus4", "dim", "maj7"], correctIndex: 0, explanation: "9th 텐션이 더해진 C9입니다.", conceptTag: "chord", audio: { type: "chord", rootMidi: 60, quality: "C9" } },
  { id: "ear-rhythm-triplet", kind: "ear_rhythm", tier: 1, prompt: "재생된 리듬 패턴은?", options: ["▮ ▮ ▮", "▮▮▮(셋잇단)", "▮ · ▮", "쉼 ▮ ▮"], correctIndex: 1, explanation: "균등한 셋잇단 흐름입니다.", conceptTag: "rhythm", audio: { type: "rhythm", bpm: 88, pattern: [{ dur: "8t" }, { dur: "8t" }, { dur: "8t" }] } },
  { id: "ear-rhythm-dotted", kind: "ear_rhythm", tier: 2, prompt: "재생된 리듬 패턴은?", options: ["점음표", "셋잇단", "싱코페이션", "온음표"], correctIndex: 0, explanation: "길게-짧게 이어지는 점음표 패턴입니다.", conceptTag: "rhythm", audio: { type: "rhythm", bpm: 76, pattern: [{ dur: "4n." }, { dur: "8n" }] } }
];
