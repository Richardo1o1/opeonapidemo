import { ApiReference } from '@scalar/nextjs-api-reference';

const config = {
  theme: "kepler",
  layout: "classic",
  defaultHttpClient: {
    targetKey: "js",
    clientKey: "fetch",
  },
  spec: {
    url: '/api/doc',
  },
};

export const GET = ApiReference(config);