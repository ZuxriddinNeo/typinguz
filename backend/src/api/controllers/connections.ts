import {
  CreateConnectionRequest,
  CreateConnectionResponse,
  GetConnectionsQuery,
  GetConnectionsResponse,
  IdPathParams,
  UpdateConnectionRequest,
} from "@typeuz/contracts/connections";
import { TypeUZRequest } from "../types";
import { TypeUZResponse } from "../../utils/typeuz-response";
import * as ConnectionsDal from "../../dal/connections";
import * as UserDal from "../../dal/user";
import { replaceObjectId, omit } from "../../utils/misc";
import TypeUZError from "../../utils/error";

import { Connection } from "@typeuz/schemas/connections";

function convert(db: ConnectionsDal.DBConnection): Connection {
  return replaceObjectId(omit(db, ["key"]));
}
export async function getConnections(
  req: TypeUZRequest<GetConnectionsQuery>,
): Promise<GetConnectionsResponse> {
  const { uid } = req.ctx.decodedToken;
  const { status, type } = req.query;

  const results = await ConnectionsDal.getConnections({
    initiatorUid:
      type === undefined || type.includes("outgoing") ? uid : undefined,
    receiverUid:
      type === undefined || type?.includes("incoming") ? uid : undefined,
    status: status,
  });

  return new TypeUZResponse("Connections retrieved", results.map(convert));
}

export async function createConnection(
  req: TypeUZRequest<undefined, CreateConnectionRequest>,
): Promise<CreateConnectionResponse> {
  const { uid } = req.ctx.decodedToken;
  const { receiverName } = req.body;
  const { maxPerUser } = req.ctx.configuration.connections;

  const receiver = await UserDal.getUserByName(
    receiverName,
    "create connection",
  );

  if (uid === receiver.uid) {
    throw new TypeUZError(400, "You cannot be your own friend, sorry.");
  }

  const initiator = await UserDal.getPartialUser(uid, "create connection", [
    "uid",
    "name",
  ]);

  const result = await ConnectionsDal.create(initiator, receiver, maxPerUser);

  return new TypeUZResponse("Connection created", convert(result));
}

export async function deleteConnection(
  req: TypeUZRequest<undefined, undefined, IdPathParams>,
): Promise<TypeUZResponse> {
  const { uid } = req.ctx.decodedToken;
  const { id } = req.params;

  await ConnectionsDal.deleteById(uid, id);

  return new TypeUZResponse("Connection deleted", null);
}

export async function updateConnection(
  req: TypeUZRequest<undefined, UpdateConnectionRequest, IdPathParams>,
): Promise<TypeUZResponse> {
  const { uid } = req.ctx.decodedToken;
  const { id } = req.params;
  const { status } = req.body;

  await ConnectionsDal.updateStatus(uid, id, status);

  return new TypeUZResponse("Connection updated", null);
}
