import openapi from "@/public/openapi.json";
import apis from "@/public/apis.json";
import wellKnownApis from "@/public/.well-known/apis.json";
import postman from "@/public/omt-rates.postman_collection.json";

export { apis, openapi, postman, wellKnownApis };

export const apiCatalog = {
  "linkset": [
    {
      "anchor": "https://onlinemoneytransfer.co.uk/api/v1/corridors",
      "service-desc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/openapi.json",
          "type": "application/vnd.oai.openapi+json;version=3.1"
        }
      ],
      "service-doc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/api",
          "type": "text/html"
        }
      ],
      "service-meta": [
        {
          "href": "https://onlinemoneytransfer.co.uk/apis.json",
          "type": "application/json"
        }
      ],
      "item": [
        {
          "href": "https://onlinemoneytransfer.co.uk/api/v1/corridors"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/v1/rates/uk-to-united-states"
        }
      ]
    },
    {
      "anchor": "https://onlinemoneytransfer.co.uk/api/research/vulnerability-index",
      "service-desc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/openapi.json",
          "type": "application/vnd.oai.openapi+json;version=3.1"
        }
      ],
      "service-doc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/research/uk-remittance-vulnerability-index",
          "type": "text/html"
        }
      ],
      "service-meta": [
        {
          "href": "https://onlinemoneytransfer.co.uk/apis.json",
          "type": "application/json"
        }
      ],
      "item": [
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/vulnerability-index"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/vulnerability-index/csv"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/vulnerability-index/official-corridors/csv"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/vulnerability-index/provider-comparisons/csv"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/vulnerability-index/history/csv"
        }
      ]
    },
    {
      "anchor": "https://onlinemoneytransfer.co.uk/api/research/last-mile-tax",
      "service-desc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/openapi.json",
          "type": "application/vnd.oai.openapi+json;version=3.1"
        }
      ],
      "service-doc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/research/last-mile-tax",
          "type": "text/html"
        }
      ],
      "service-meta": [
        {
          "href": "https://onlinemoneytransfer.co.uk/apis.json",
          "type": "application/json"
        }
      ],
      "item": [
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/last-mile-tax"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/last-mile-tax/csv"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/last-mile-tax/matched-offers/csv"
        }
      ]
    },
    {
      "anchor": "https://onlinemoneytransfer.co.uk/api/research/weekly-transfer-costs",
      "service-desc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/openapi.json",
          "type": "application/vnd.oai.openapi+json;version=3.1"
        }
      ],
      "service-doc": [
        {
          "href": "https://onlinemoneytransfer.co.uk/research/weekly-transfer-costs",
          "type": "text/html"
        }
      ],
      "service-meta": [
        {
          "href": "https://onlinemoneytransfer.co.uk/apis.json",
          "type": "application/json"
        }
      ],
      "item": [
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/weekly-transfer-costs"
        },
        {
          "href": "https://onlinemoneytransfer.co.uk/api/research/weekly-transfer-costs?format=csv"
        }
      ]
    }
  ]
};
