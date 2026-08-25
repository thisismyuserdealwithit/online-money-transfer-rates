import openapi from "@/public/openapi.json";
import apis from "@/public/apis.json";
import wellKnownApis from "@/public/.well-known/apis.json";
import postman from "@/public/omt-rates.postman_collection.json";

export { apis, openapi, postman, wellKnownApis };

export const apiCatalog = {
  linkset: [
    {
      anchor: "https://onlinemoneytransfer.co.uk/api/v1/corridors",
      "service-desc": [
        {
          href: "https://onlinemoneytransfer.co.uk/openapi.json",
          type: "application/vnd.oai.openapi+json;version=3.1",
        },
      ],
      "service-doc": [
        {
          href: "https://onlinemoneytransfer.co.uk/api",
          type: "text/html",
        },
      ],
      "service-meta": [
        {
          href: "https://onlinemoneytransfer.co.uk/apis.json",
          type: "application/json",
        },
      ],
      item: [
        { href: "https://onlinemoneytransfer.co.uk/api/v1/corridors" },
        { href: "https://onlinemoneytransfer.co.uk/api/v1/rates/uk-to-united-states" },
      ],
    },
  ],
};
