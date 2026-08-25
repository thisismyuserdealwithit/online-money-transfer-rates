# Online Money Transfer Rates for Python

A dependency-free Python client for the free [Online Money Transfer rates API](https://onlinemoneytransfer.co.uk/api).

```python
from online_money_transfer_rates import OnlineMoneyTransferClient, attribution_for

omt = OnlineMoneyTransferClient()
result = omt.get_rates("uk-to-united-states", history=14)
print(result["current"]["rates"])
print(attribution_for(result))
```

Use `list_corridors()` to discover the 52 supported route slugs and `get_rates_csv()` for CSV text.

API data is free for commercial and non-commercial use when displayed figures include a visible link to `result["useTerms"]["requiredLink"]` and keep each rate's capture time and evidence status visible. The client code is MIT licensed. [Read the API terms](https://onlinemoneytransfer.co.uk/api/terms).
