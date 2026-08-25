const DEFAULT_BASE_URL = "https://onlinemoneytransfer.co.uk";

function cleanBaseUrl(value) {
  return String(value || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function cleanRoute(value) {
  const route = String(value || "").toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route)) {
    throw new TypeError("route must be an Online Money Transfer corridor slug");
  }
  return route;
}

function cleanHistory(value = 14) {
  const history = Number(value);
  if (!Number.isInteger(history) || history < 1 || history > 30) {
    throw new RangeError("history must be an integer from 1 to 30");
  }
  return history;
}

export class OnlineMoneyTransferClient {
  constructor({ baseUrl = DEFAULT_BASE_URL, fetch: fetchImplementation = globalThis.fetch } = {}) {
    if (typeof fetchImplementation !== "function") {
      throw new TypeError("A fetch implementation is required");
    }
    this.baseUrl = cleanBaseUrl(baseUrl);
    this.fetch = fetchImplementation;
  }

  async request(path, accept) {
    const response = await this.fetch(`${this.baseUrl}${path}`, {
      headers: { accept },
    });
    if (!response.ok) {
      let detail = "";
      try {
        detail = `: ${await response.text()}`;
      } catch {}
      throw new Error(`Online Money Transfer API returned ${response.status}${detail}`);
    }
    return response;
  }

  async listCorridors() {
    return (await this.request("/api/v1/corridors", "application/json")).json();
  }

  async getRates(route, { history = 14 } = {}) {
    const path = `/api/v1/rates/${encodeURIComponent(cleanRoute(route))}?history=${cleanHistory(history)}`;
    return (await this.request(path, "application/json")).json();
  }

  async getRatesCsv(route, { history = 14 } = {}) {
    const path = `/api/v1/rates/${encodeURIComponent(cleanRoute(route))}/csv?history=${cleanHistory(history)}`;
    return (await this.request(path, "text/csv")).text();
  }
}

export function attributionFor(response) {
  const terms = response?.useTerms;
  if (!terms?.requiredLink) {
    throw new TypeError("The response does not contain OMT attribution terms");
  }
  return {
    text: terms.wording || "Rates supplied by Online Money Transfer",
    href: terms.requiredLink,
    placement: terms.placement,
    timestampRequired: terms.timestampRequired !== false,
    statusRequired: terms.statusRequired !== false,
    context: terms.context,
  };
}

export const createClient = (options) => new OnlineMoneyTransferClient(options);
