import { HttpError } from "@rapidstack/lambda"

export const errorsHandler = {
  '400': { get: async () => { throw new HttpError(400) } },
  '401': { get: async () => { throw new HttpError(401) } },
  '403': { get: async () => { throw new HttpError(403) } },
  '404': { get: async () => { throw new HttpError(404) } },
  '500': { get: async () => { throw new HttpError(500) } },
  '501': { get: async () => { throw new HttpError(501) } },
  '503': { get: async () => { throw new HttpError(503) } },
} as const;