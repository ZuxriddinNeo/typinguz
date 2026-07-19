import { PostGithubReleaseRequest } from "@typeuz/contracts/webhooks";
import GeorgeQueue from "../../queues/george-queue";
import { TypeUZResponse } from "../../utils/typeuz-response";
import TypeUZError from "../../utils/error";
import { TypeUZRequest } from "../types";

export async function githubRelease(
  req: TypeUZRequest<undefined, PostGithubReleaseRequest>,
): Promise<TypeUZResponse> {
  const action = req.body.action;

  if (action === "published") {
    const releaseId = req.body.release?.id;
    if (releaseId === undefined) {
      throw new TypeUZError(422, 'Missing property "release.id".');
    }

    await GeorgeQueue.sendReleaseAnnouncement(releaseId);
    return new TypeUZResponse("Added release announcement task to queue", null);
  }
  return new TypeUZResponse("No action taken", null);
}
