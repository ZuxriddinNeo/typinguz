import { queryOptions } from "@tanstack/solid-query";
import { baseKey } from "./utils/keys";

const queryKeys = {
  root: () => baseKey("serverConfiguration"),
};

const staleTime = Infinity;

// oxlint-disable-next-line typescript/explicit-function-return-type
export const getServerConfigurationQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.root(),
    queryFn: async () => {
      const { get } = await import("../ape/server-configuration");
      return get();
    },
    staleTime,
    gcTime: Infinity,
  });
