# Online Money Transfer Rates for JavaScript

A dependency-free browser and Node.js client for the free [Online Money Transfer rates API](https://onlinemoneytransfer.co.uk/api).

```js
import { createClient, attributionFor } from "online-money-transfer-rates";

const omt = createClient();
const result = await omt.getRates("uk-to-united-states", { history: 14 });
console.log(result.current.rates);
console.log(attributionFor(result));
```

Use `listCorridors()` to discover the 52 supported route slugs and `getRatesCsv()` for the CSV representation.

API data is free for commercial and non-commercial use when displayed figures include a visible link to `result.useTerms.requiredLink` and keep each rate's capture time and evidence status visible. The client code is MIT licensed. [Read the API terms](https://onlinemoneytransfer.co.uk/api/terms).
