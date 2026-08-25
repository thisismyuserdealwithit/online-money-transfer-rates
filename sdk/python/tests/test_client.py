import io
import json
import unittest

from online_money_transfer_rates import OnlineMoneyTransferClient, attribution_for


class Response(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class ClientTests(unittest.TestCase):
    def test_builds_requests_and_extracts_attribution(self):
        requested = []

        def opener(request, timeout):
            requested.append((request.full_url, timeout))
            body = json.dumps({
                "useTerms": {
                    "requiredLink": "https://example.test/uk-to-spain",
                    "wording": "Rates supplied",
                    "placement": "Beside rates",
                }
            }).encode()
            return Response(body)

        client = OnlineMoneyTransferClient("https://example.test/", opener=opener, timeout=3)
        result = client.get_rates("uk-to-spain", history=7)
        self.assertEqual(requested, [("https://example.test/api/v1/rates/uk-to-spain?history=7", 3)])
        self.assertEqual(attribution_for(result)["href"], "https://example.test/uk-to-spain")

    def test_rejects_invalid_values(self):
        client = OnlineMoneyTransferClient(opener=lambda *_args, **_kwargs: None)
        with self.assertRaises(ValueError):
            client.get_rates("https://bad.example")
        with self.assertRaises(ValueError):
            client.get_rates("uk-to-spain", history=0)


if __name__ == "__main__":
    unittest.main()
