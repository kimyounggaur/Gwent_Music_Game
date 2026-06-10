import { CHALLENGE_BANK } from "./bank";
import type { AnswerResult, ChallengeRef } from "./types";

const ANSWERS = new Map(
  CHALLENGE_BANK.map((challenge) => [
    challenge.id,
    {
      answer: challenge.options[challenge.correctIndex],
      explanation: challenge.explanation,
      conceptTag: challenge.conceptTag
    }
  ])
);

export async function checkAnswer(challengeRef: ChallengeRef, submission: string | string[]): Promise<AnswerResult> {
  const answer = ANSWERS.get(challengeRef);
  if (!answer) return { correct: false, explanation: "알 수 없는 문제입니다.", conceptTag: "unknown" };
  const submitted = Array.isArray(submission) ? submission.join("|") : submission;
  return {
    correct: submitted === answer.answer,
    explanation: answer.explanation,
    conceptTag: answer.conceptTag
  };
}
