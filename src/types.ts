import { ChalkInstance } from 'chalk';
import { Token, Tokens } from 'marked';

export interface CliRendererOptions {
  // terminal
  lineLength: number;
  indent: string;
  mode?: 'dark' | 'light';

  // text
  strongStyle: ChalkInstance;
  emStyle: ChalkInstance;
  delStyle: ChalkInstance;

  // heading
  headingLevels: string[];
  headingStyle: ChalkInstance;

  // code
  codeStyle: ChalkInstance;
  codeInfoStyle: ChalkInstance;

  // block-quote
  quotePadding: number;
  quoteChar: string;
  quoteStyle: ChalkInstance;

  // hr
  hrChar: string;
  hrStyle: ChalkInstance;

  // lists
  listStyle: ChalkInstance;
  listChar: string;

  // checkbox
  cbCheckedChar: string;
  cbUncheckedChar: string;
  cbStyle: ChalkInstance;

  // link
  linkStyle: ChalkInstance;

  // table
  // todo complete options
  tableWordWrap: boolean;
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type InfoString = string | undefined;
export type CellFlags = {
  header: boolean;
  align: 'center' | 'left' | 'right' | null;
};

// Re-export marked's token types for convenience
export { Token, Tokens };

export type RendererToken =
  | Tokens.Text
  | Tokens.Strong
  | Tokens.Em
  | Tokens.Del
  | Tokens.Codespan
  | Tokens.Br
  | Tokens.Link
  | Tokens.Image
  | Tokens.Code
  | Tokens.Blockquote
  | Tokens.Paragraph
  | Tokens.Heading
  | Tokens.Hr
  | Tokens.Space
  | Tokens.List;
