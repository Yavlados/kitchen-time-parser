export interface StatisticsResult {
  inserted: string;
  updated: string;
  nonAffected: string;
}

export function processArraysToLog(d: {
  inserted: string[];
  updated: string[];
  nonAffected: string[];
}): StatisticsResult[] {
  const { inserted, updated, nonAffected } = d;
  const results: StatisticsResult[] = [];
  let state = true;
  let i = 0;
  while (state) {
    const ins = inserted[i];
    const upd = updated[i];
    const non = nonAffected[i];

    state = !!ins || !!upd || !!non;

    if (state) {
      results.push({ inserted: ins, nonAffected: non, updated: upd });
      i++;
    }
  }
  return results;
}
