
export function findMatches(items = []) {
  const activeItems = items.filter((item) => item.status === "active");

  const lostItems = activeItems.filter((item) => item.type === "lost");
  const foundItems = activeItems.filter((item) => item.type === "found");

  const matches = [];

  lostItems.forEach((lost) => {
    foundItems.forEach((found) => {
      let score = 0;
      const reasons = [];

      if (
        lost.title?.trim().toLowerCase() ===
        found.title?.trim().toLowerCase()
      ) {
        score += 40;
        reasons.push("Same item name");
      }

      if (
        lost.category?.toLowerCase() === found.category?.toLowerCase()
      ) {
        score += 25;
        reasons.push("Same category");
      }

      if (
        lost.location?.trim().toLowerCase() ===
        found.location?.trim().toLowerCase()
      ) {
        score += 20;
        reasons.push("Same location");
      }

      if (score >= 25) {
        matches.push({ lost, found, score, reasons });
      }
    });
  });

  return matches.sort((a, b) => b.score - a.score);
}
