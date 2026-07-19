import {
  AddPresetRequest,
  AddPresetResponse,
  DeletePresetsParams,
  GetPresetResponse,
} from "@typeuz/contracts/presets";
import * as PresetDAL from "../../dal/preset";
import { TypeUZResponse } from "../../utils/typeuz-response";
import { replaceObjectId } from "../../utils/misc";
import { EditPresetRequest } from "@typeuz/schemas/presets";
import { TypeUZRequest } from "../types";

export async function getPresets(
  req: TypeUZRequest,
): Promise<GetPresetResponse> {
  const { uid } = req.ctx.decodedToken;

  const data = (await PresetDAL.getPresets(uid))
    .map((preset) => ({
      ...preset,
      uid: undefined,
    }))
    .map((it) => replaceObjectId(it));

  return new TypeUZResponse("Presets retrieved", data);
}

export async function addPreset(
  req: TypeUZRequest<undefined, AddPresetRequest>,
): Promise<AddPresetResponse> {
  const { uid } = req.ctx.decodedToken;

  const data = await PresetDAL.addPreset(uid, req.body);

  return new TypeUZResponse("Preset created", data);
}

export async function editPreset(
  req: TypeUZRequest<undefined, EditPresetRequest>,
): Promise<TypeUZResponse> {
  const { uid } = req.ctx.decodedToken;

  await PresetDAL.editPreset(uid, req.body);

  return new TypeUZResponse("Preset updated", null);
}

export async function removePreset(
  req: TypeUZRequest<undefined, undefined, DeletePresetsParams>,
): Promise<TypeUZResponse> {
  const { presetId } = req.params;
  const { uid } = req.ctx.decodedToken;

  await PresetDAL.removePreset(uid, presetId);

  return new TypeUZResponse("Preset deleted", null);
}
