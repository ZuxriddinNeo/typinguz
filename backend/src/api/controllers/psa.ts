import { GetPsaResponse } from "@typeuz/contracts/psas";
import * as PsaDAL from "../../dal/psa";
import { TypeUZResponse } from "../../utils/typeuz-response";
import { replaceObjectIds } from "../../utils/misc";
import { TypeUZRequest } from "../types";
import { PSA } from "@typeuz/schemas/psas";
import { cacheWithTTL } from "../../utils/ttl-cache";

//cache for one minute
const cache = cacheWithTTL<PSA[]>(1 * 60 * 1000, async () => {
  return replaceObjectIds(await PsaDAL.get());
});

export async function getPsas(_req: TypeUZRequest): Promise<GetPsaResponse> {
  return new TypeUZResponse("PSAs retrieved", (await cache()) ?? []);
}
