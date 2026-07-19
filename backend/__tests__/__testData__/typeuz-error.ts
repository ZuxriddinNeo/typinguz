import { expect } from "vitest";
import TypeUZError from "../../src/utils/error";
import { MatcherResult } from "../vitest";

export function enableMonkeyErrorExpects(): void {
  expect.extend({
    toMatchMonkeyError(
      received: TypeUZError,
      expected: TypeUZError,
    ): MatcherResult {
      return {
        pass:
          received.status === expected.status &&
          received.message === expected.message,
        message: () => "TypeUZError does not match:",
        actual: { status: received.status, message: received.message },
        expected: { status: expected.status, message: expected.message },
      };
    },
  });
}
