export interface RunFilter {
  language?: string;
  guideId?: number;
  lesson?: string;
  exerciseId?: number;
}

export function matches(fixture: { language: string; guideId: number; lesson: string; id: number }, f: RunFilter): boolean {
  if (f.exerciseId !== undefined) return fixture.id === f.exerciseId;
  if (f.language && fixture.language !== f.language) return false;
  if (f.guideId !== undefined && fixture.guideId !== f.guideId) return false;
  if (f.lesson && fixture.lesson !== f.lesson) return false;
  return true;
}

export function filterFromEnv(): RunFilter {
  const env = process.env;
  return {
    language: env.YUKIGO_E2E_LANGUAGE,
    guideId: env.YUKIGO_E2E_GUIDE ? Number(env.YUKIGO_E2E_GUIDE) : undefined,
    lesson: env.YUKIGO_E2E_LESSON,
    exerciseId: env.YUKIGO_E2E_EXERCISE ? Number(env.YUKIGO_E2E_EXERCISE) : undefined,
  };
}