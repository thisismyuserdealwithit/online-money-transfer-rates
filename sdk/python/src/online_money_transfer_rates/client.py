"""Dependency-free Online Money Transfer API client."""

from __future__ import annotations

import json
import re
from typing import Any, Callable, Dict
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "https://onlinemoneytransfer.co.uk"
ROUTE_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class OnlineMoneyTransferClient:
    """Read supported corridors and timestamped rate evidence."""

    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        opener: Callable[..., Any] = urlopen,
        timeout: float = 15.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._opener = opener
        self.timeout = timeout

    @staticmethod
    def _route(value: str) -> str:
        route = str(value).lower()
        if not ROUTE_PATTERN.fullmatch(route):
            raise ValueError("route must be an Online Money Transfer corridor slug")
        return route

    @staticmethod
    def _history(value: int) -> int:
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 30:
            raise ValueError("history must be an integer from 1 to 30")
        return value

    def _read(self, path: str, accept: str) -> bytes:
        request = Request(
            f"{self.base_url}{path}",
            headers={"Accept": accept, "User-Agent": "online-money-transfer-rates-python/0.1.0"},
        )
        with self._opener(request, timeout=self.timeout) as response:
            return response.read()

    def list_corridors(self) -> Dict[str, Any]:
        """Return every supported route and its currencies."""
        return json.loads(self._read("/api/v1/corridors", "application/json"))

    def get_rates(self, route: str, history: int = 14) -> Dict[str, Any]:
        """Return current and historical evidence for one corridor."""
        path = f"/api/v1/rates/{self._route(route)}?{urlencode({'history': self._history(history)})}"
        return json.loads(self._read(path, "application/json"))

    def get_rates_csv(self, route: str, history: int = 14) -> str:
        """Return current and historical evidence as CSV text."""
        path = f"/api/v1/rates/{self._route(route)}/csv?{urlencode({'history': self._history(history)})}"
        return self._read(path, "text/csv").decode("utf-8")


def attribution_for(response: Dict[str, Any]) -> Dict[str, Any]:
    """Extract the visible attribution required when rates are displayed."""
    terms = response.get("useTerms") or {}
    required_link = terms.get("requiredLink")
    if not required_link:
        raise ValueError("The response does not contain OMT attribution terms")
    return {
        "text": terms.get("wording") or "Rates supplied by Online Money Transfer",
        "href": required_link,
        "placement": terms.get("placement"),
        "timestamp_required": terms.get("timestampRequired", True),
        "status_required": terms.get("statusRequired", True),
        "context": terms.get("context"),
    }
