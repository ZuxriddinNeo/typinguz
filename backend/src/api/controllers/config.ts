import { PartialConfig } from "@typeuz/schemas/configs";
import * as ConfigDAL from "../../dal/config";
import { TypeUZResponse } from "../../utils/typeuz-response";
import { GetConfigResponse } from "@typeuz/contracts/configs";
import { TypeUZRequest } from "../types";

export async function getConfig(
  req: TypeUZRequest,
): Promise<GetConfigResponse> {
  const { uid } = req.ctx.decodedToken;
  const data = (await ConfigDAL.getConfig(uid))?.config ?? null;

  return new TypeUZResponse("Configuration retrieved", data);
}

export async function saveConfig(
  req: TypeUZRequest<undefined, PartialConfig>,
): Promise<TypeUZResponse> {
  const config = req.body;
  const { uid } = req.ctx.decodedToken;

  await ConfigDAL.saveConfig(uid, config);

  return new TypeUZResponse("Config updated", null);
}

export async function deleteConfig(
  req: TypeUZRequest,
): Promise<TypeUZResponse> {
  const { uid } = req.ctx.decodedToken;

  await ConfigDAL.deleteConfig(uid);
  return new TypeUZResponse("Config deleted", null);
}
