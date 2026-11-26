const datePattern = /^(\d{4}(?:-\d{2})?(?:-\d{2})?)(?:\s|$)/;
export function keywordKey(value) {
  return value.replace(/\s*:\s*\(.*$/, "").toLowerCase().replace(/[\s·-]/g, "").trim();
}

// Use comma- or tab-separated Google Trends exports, keeping each chart on its own scale.
export function parseTrends(contents) {
  const rows = [];
  const delimiter = contents.includes("\t") && !contents.includes(",") ? "\t" : ",";
  let current = [];
  let cell = "";
  let quote = false;
  const input = contents.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n") + "\n";
  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (character === '"') {
      if (quote && input[i + 1] === '"') { cell += '"'; i++; }
      else quote = !quote;
    } else if (!quote && (character === delimiter || character === "\n")) {
      current.push(cell.trim());
      cell = "";
      if (character === "\n") { rows.push(current); current = []; }
    } else cell += character;
  }
  const first = rows.findIndex((row, index) => row.length > 1 && rows[index + 1] && datePattern.test(rows[index + 1][0]));
  if (quote || first === -1) throw new Error("No Trends time series in this CSV");
  const dates = [];
  const sums = rows[first].slice(1).map((term) => ({ term, sum: 0, count: 0 }));
  for (const row of rows.slice(first + 1)) {
    if (!datePattern.test(row[0])) continue;
    dates.push(row[0]);
    for (const [i, entry] of sums.entries()) {
      const raw = row[i + 1];
      if (!raw || !/^(<1|\d{1,3}(?:\.\d+)?)$/.test(raw)) continue;
      const n = raw === "<1" ? 0.5 : Number(raw);
      if (n > 100) continue;
      entry.sum += n;
      entry.count++;
    }
  }
  if (!sums.some((entry) => entry.count > 0)) throw new Error("No numeric Trends values");
  dates.sort();
  return { range: [dates[0], dates.at(-1)], scores: new Map(sums.filter((entry) => entry.count > 0)
    .map((entry) => [keywordKey(entry.term), Math.round(entry.sum * 10 / entry.count) / 10])) };
}
