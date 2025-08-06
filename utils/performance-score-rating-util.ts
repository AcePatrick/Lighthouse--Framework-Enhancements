export const performanceScoreRating = (performanceScore: number): string => {

  if (performanceScore < 50) return "Poor";
  if (performanceScore < 90) return "Needs Improvement";
  if (performanceScore < 100) return "Good";

  return "Invalid";
}