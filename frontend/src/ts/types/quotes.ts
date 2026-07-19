import { Language } from "@typeuz/schemas/languages";
import { QuoteDataQuote } from "@typeuz/schemas/quotes";
import { RequiredProperties } from "../utils/misc";

export type Quote = QuoteDataQuote & {
  group: number;
  language: Language;
  textSplit?: string[];
};

export type QuoteWithTextSplit = RequiredProperties<Quote, "textSplit">;
