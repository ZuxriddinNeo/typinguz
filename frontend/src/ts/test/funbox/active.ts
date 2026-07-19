import { Config } from "../../config/store";
import { FunboxProperty, getFunboxObject } from "@typeuz/funbox";
import { FunboxName } from "@typeuz/schemas/configs";

const metadata = getFunboxObject();

export function getActiveFunboxNames(): FunboxName[] {
  return Config.funbox ?? [];
}

export function isFunboxActive(funbox: FunboxName): boolean {
  return getActiveFunboxNames().includes(funbox);
}

export function isFunboxActiveWithProperty(property: FunboxProperty): boolean {
  return getActiveFunboxNames().some((name) =>
    metadata[name]?.properties?.includes(property),
  );
}
