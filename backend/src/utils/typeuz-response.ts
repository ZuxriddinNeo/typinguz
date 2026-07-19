import { TypeUZResponseType } from "@typeuz/contracts/util/api";

export type TypeUZDataAware<T> = {
  data: T | null;
};

export class TypeUZResponse<T = null>
  implements TypeUZResponseType, TypeUZDataAware<T>
{
  public message: string;
  public data: T;

  constructor(message: string, data: T) {
    this.message = message;
    this.data = data;
  }
}
