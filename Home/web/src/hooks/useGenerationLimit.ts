const GENERATION_COUNT_KEY = 'generations_count';
const FREE_GENERATION_LIMIT = 1;

export function useGenerationLimit() {
  const getGenerationCount = () => Number.parseInt(localStorage.getItem(GENERATION_COUNT_KEY) || '0', 10);

  const canGenerate = () => getGenerationCount() < FREE_GENERATION_LIMIT;

  const trackGeneration = () => {
    localStorage.setItem(GENERATION_COUNT_KEY, String(getGenerationCount() + 1));
  };

  const rollbackGeneration = () => {
    localStorage.setItem(GENERATION_COUNT_KEY, String(Math.max(0, getGenerationCount() - 1)));
  };

  return { canGenerate, trackGeneration, rollbackGeneration };
}
