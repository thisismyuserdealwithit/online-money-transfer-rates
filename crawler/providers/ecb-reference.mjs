import { execFileSync } from "node:child_process";

const cache = new Map();

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value);
  return values;
}

function startPeriod() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 10);
  return date.toISOString().slice(0, 10);
}

function latestCurrencyPerEuro(currency) {
  if (currency === "EUR") return { currency, rate: 1, referenceDate: null, sourceUrl: null };
  if (cache.has(currency)) return cache.get(currency);
  const sourceUrl = `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A?format=csvdata&startPeriod=${startPeriod()}`;
  const text = execFileSync("curl", ["-sS", "--max-time", "45", "-A", "Mozilla/5.0", sourceUrl], {
    encoding: "utf8",
    maxBuffer: 8_000_000,
  });
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error(`ECB did not return a recent ${currency} reference rate`);
  const headers = parseCsvLine(lines[0]);
  const dateIndex = headers.indexOf("TIME_PERIOD");
  const valueIndex = headers.indexOf("OBS_VALUE");
  if (dateIndex < 0 || valueIndex < 0) throw new Error("ECB response columns changed");
  const rows = lines.slice(1).map(parseCsvLine).filter((row) => row[dateIndex] && row[valueIndex]);
  rows.sort((a, b) => a[dateIndex].localeCompare(b[dateIndex]));
  const latest = rows.at(-1);
  const rate = Number(latest?.[valueIndex]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`ECB returned an invalid ${currency} reference rate`);
  const result = { currency, rate, referenceDate: latest[dateIndex], sourceUrl };
  cache.set(currency, result);
  return result;
}

export function ecbGbpToTarget(targetCurrency) {
  const gbp = latestCurrencyPerEuro("GBP");
  const target = latestCurrencyPerEuro(targetCurrency);
  return {
    rate: target.rate / gbp.rate,
    referenceDate: target.referenceDate || gbp.referenceDate,
    gbpPerEuro: gbp.rate,
    targetPerEuro: target.rate,
    sourceUrls: [gbp.sourceUrl, target.sourceUrl].filter(Boolean),
  };
}
