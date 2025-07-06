import { chalk, highlight, Renderer, Table } from './deps.js';
import {
  CellFlags,
  CliRendererOptions,
  HeadingLevel,
  InfoString
} from './types.js';
import {
  asArray,
  asObject,
  fromArray,
  fromNestedArray,
  pipe,
  textify,
  wrapper
} from './utils.js';

const SEP = ' '; // separator
const EOL = '\n'; // end of line
const LI = '྿'; // list character
const NOT_EMPTY = flag => !!flag;

const block = text => EOL + text + EOL;
const lines = (text: string, mapper: (s) => string) =>
  text.split(EOL).map(mapper).join(EOL) + EOL;

export class CliRenderer extends Renderer {
  constructor(public readonly opts: CliRendererOptions) {
    super();
  }

  // Helper method to parse tokens recursively
  private parseTokens(tokens: any[]): string {
    return tokens
      .map(token => {
        switch (token.type) {
          case 'text':
            return token.text;
          case 'strong':
            return this.strong(token);
          case 'em':
            return this.em(token);
          case 'codespan':
            return this.codespan(token);
          case 'del':
            return this.del(token);
          case 'link':
            return this.link(token);
          case 'image':
            return this.image(token);
          case 'br':
            return this.br();
          case 'list':
            return this.list(token);
          case 'code':
            return this.code(token);
          case 'blockquote':
            return this.blockquote(token);
          case 'paragraph':
            return this.paragraph(token);
          case 'heading':
            return this.heading(token);
          case 'hr':
            return this.hr();
          case 'space':
            return ''; // Space tokens should not render anything
          default:
            return token.text || token.raw || '';
        }
      })
      .join('');
  }

  // INLINE

  checkbox({ checked }: { checked: boolean }): string {
    const { cbStyle, cbUncheckedChar, cbCheckedChar } = this.opts;
    return cbStyle(checked ? cbCheckedChar : cbUncheckedChar) + SEP;
  }

  strong({ tokens }: { tokens: any[] }): string {
    const text = this.parseTokens(tokens);
    return this.opts.strongStyle(text);
  }

  em({ tokens }: { tokens: any[] }): string {
    const text = this.parseTokens(tokens);
    return this.opts.emStyle(text);
  }

  codespan({ text }: { text: string }): string {
    return this.opts.emStyle(this.opts.codeStyle(text));
  }

  br(): string {
    return EOL;
  }

  del({ tokens }: { tokens: any[] }): string {
    const text = this.parseTokens(tokens);
    return this.opts.delStyle(text);
  }

  link({
    href,
    title,
    tokens
  }: {
    href: string | null;
    title?: string | null;
    tokens: any[];
  }): string {
    // todo need to be refactor
    const { linkStyle } = this.opts;
    const text = this.parseTokens(tokens);
    // if (supportsHyperlinks.stout || true) {
    //     return hyperLinker(linkStyle(text), href);
    // }
    return href === text ? linkStyle(href) : `${text}(${linkStyle(href)})`;
  }

  image({
    href,
    title,
    text
  }: {
    href: string | null;
    title: string | null;
    text: string;
  }): string {
    // no image support in terminal
    return '🌆';
  }

  text(token: { text: string }): string {
    // todo do we need the wrapper here?
    return textify()(token.text);
    // return textify(this.wrapper)(text);
  }

  // BLOCK

  code({
    text,
    lang,
    escaped
  }: {
    text: string;
    lang?: string;
    escaped?: boolean;
  }): string {
    const { lineLength, codeStyle, codeInfoStyle } = this.opts;
    const mapper = line =>
      SEP + codeStyle((SEP + line).padEnd(lineLength - 2, SEP));
    const rendered = lines(block(text.trim()), mapper);
    return lang
      ? highlight(rendered, { language: lang }) +
          SEP +
          codeInfoStyle(SEP + lang + SEP) +
          EOL
      : rendered;
  }

  blockquote({ tokens }: { tokens: any[] }) {
    const { quotePadding, quoteChar, quoteStyle } = this.opts;
    const quote = this.parseTokens(tokens);
    const mapper = line =>
      quoteStyle(SEP.repeat(quotePadding) + quoteChar + SEP + line);
    return block(lines(quote.trim(), mapper));
  }

  heading({ tokens, depth }: { tokens: any[]; depth: number }): string {
    const { headingLevels, headingStyle, lineLength, indent } = this.opts;
    const text = this.parseTokens(tokens);
    const levelStyle = chalk.hex(headingLevels[(depth as HeadingLevel) - 1]);
    const wrapperFn = wrapper({ width: lineLength, indent });
    return pipe(levelStyle, headingStyle, wrapperFn, block)(text);
  }

  hr(): string {
    const { lineLength, hrStyle, hrChar } = this.opts;
    return block(SEP + hrStyle(hrChar.repeat(lineLength - 2)) + SEP);
  }

  paragraph({ tokens }: { tokens: any[] }): string {
    const text = this.parseTokens(tokens);
    const { lineLength, indent } = this.opts;
    const wrapperFn = wrapper({ width: lineLength, indent });
    return block(wrapperFn(text));
  }

  // COMPOUND

  html({ text }: { text: string }): string {
    return block(chalk.redBright('HTML not implemented'));
  }

  list(token: {
    items: any[];
    ordered: boolean;
    start: number | string;
  }): string {
    const { listChar, listStyle } = this.opts;
    const body = token.items.map(item => this.listitem(item)).join('');
    let start = typeof token.start === 'number' ? token.start : 1;
    const mapper = token.ordered
      ? line => SEP + line.replace(LI, listStyle(start++))
      : line => SEP + line.replace(LI, listStyle(listChar));
    return EOL + body.split(EOL).filter(NOT_EMPTY).map(mapper).join(EOL) + EOL;
  }

  listitem(item: { tokens: any[] }): string {
    const text = this.parseTokens(item.tokens);
    const mapper = (line, index) =>
      index === 0 ? `${LI} ${line}` : `  ${line}`;
    return text.split(EOL).filter(NOT_EMPTY).map(mapper).join(EOL).trim() + EOL;
  }

  table(token: { header: any[]; rows: any[][] }): string {
    const { lineLength, tableWordWrap: wordWrap } = this.opts;

    const head = token.header.map(cell => this.tablecell(cell));
    const rows = token.rows.map(row => row.map(cell => this.tablecell(cell)));

    // create table with no columns restrictions
    let table = new Table({ head, wordWrap });
    table.push(...rows);
    const output = table.toString();
    const length = output.search(EOL);
    if (length <= lineLength) {
      return output + EOL;
    }

    // re-create table with normalized columns
    const width = Math.ceil(lineLength / head.length);
    table = new Table({ head, wordWrap, colWidths: head.map(() => width) });
    table.push(...rows);
    return table.toString() + EOL;
  }

  tablerow({ text }: { text: string }): string {
    return asArray(text);
  }

  tablecell(token: {
    tokens: any[];
    header?: boolean;
    align?: 'center' | 'left' | 'right' | null;
  }): string {
    const content = this.parseTokens(token.tokens);
    return asObject(content);
  }

  // helpers
}
