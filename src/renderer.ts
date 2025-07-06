import { chalk, highlight, Renderer, Table } from './deps.js';
import {
  CellFlags,
  CliRendererOptions,
  HeadingLevel,
  InfoString,
  Token,
  Tokens,
  RendererToken
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
const NOT_EMPTY = (flag: string): boolean => !!flag;

const block = (text: string): string => EOL + text + EOL;
const lines = (text: string, mapper: (s: string) => string): string =>
  text.split(EOL).map(mapper).join(EOL) + EOL;

export class CliRenderer extends Renderer {
  constructor(public readonly opts: CliRendererOptions) {
    super();
  }

  // Helper method to parse tokens recursively
  private parseTokens(tokens: Token[]): string {
    return tokens
      .map(token => {
        // Filter to only handle tokens we know how to render
        if (!this.isRendererToken(token)) {
          return token.raw || '';
        }
        
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
        }
      })
      .join('');
  }

  // Type guard to check if token is a renderer token
  private isRendererToken(token: Token): token is RendererToken {
    return ['text', 'strong', 'em', 'del', 'codespan', 'br', 'link', 'image', 
            'code', 'blockquote', 'paragraph', 'heading', 'hr', 'space', 'list']
           .includes(token.type);
  }

  // INLINE

  checkbox({ checked }: Tokens.Checkbox): string {
    const { cbStyle, cbUncheckedChar, cbCheckedChar } = this.opts;
    return cbStyle(checked ? cbCheckedChar : cbUncheckedChar) + SEP;
  }

  strong({ tokens }: Tokens.Strong): string {
    const text = this.parseTokens(tokens);
    return this.opts.strongStyle(text);
  }

  em({ tokens }: Tokens.Em): string {
    const text = this.parseTokens(tokens);
    return this.opts.emStyle(text);
  }

  codespan({ text }: Tokens.Codespan): string {
    return this.opts.emStyle(this.opts.codeStyle(text));
  }

  br(): string {
    return EOL;
  }

  del({ tokens }: Tokens.Del): string {
    const text = this.parseTokens(tokens);
    return this.opts.delStyle(text);
  }

  link({ href, title, tokens }: Tokens.Link): string {
    // todo need to be refactor
    const { linkStyle } = this.opts;
    const text = this.parseTokens(tokens);
    // if (supportsHyperlinks.stout || true) {
    //     return hyperLinker(linkStyle(text), href);
    // }
    return href === text ? linkStyle(href) : `${text}(${linkStyle(href)})`;
  }

  image({ href, title, text }: Tokens.Image): string {
    // no image support in terminal
    return '🌆';
  }

  text({ text }: Tokens.Text): string {
    // todo do we need the wrapper here?
    return textify()(text);
    // return textify(this.wrapper)(text);
  }

  // BLOCK

  code({ text, lang, escaped }: Tokens.Code): string {
    const { lineLength, codeStyle, codeInfoStyle } = this.opts;
    const mapper = (line: string) =>
      SEP + codeStyle((SEP + line).padEnd(lineLength - 2, SEP));
    const rendered = lines(block(text.trim()), mapper);
    return lang
      ? highlight(rendered, { language: lang }) +
          SEP +
          codeInfoStyle(SEP + lang + SEP) +
          EOL
      : rendered;
  }

  blockquote({ tokens }: Tokens.Blockquote): string {
    const { quotePadding, quoteChar, quoteStyle } = this.opts;
    const quote = this.parseTokens(tokens);
    const mapper = (line: string) =>
      quoteStyle(SEP.repeat(quotePadding) + quoteChar + SEP + line);
    return block(lines(quote.trim(), mapper));
  }

  heading({ tokens, depth }: Tokens.Heading): string {
    const { headingLevels, headingStyle, lineLength, indent } = this.opts;
    const text = this.parseTokens(tokens);
    const levelStyle = chalk.hex(headingLevels[depth - 1]);
    const wrapperFn = wrapper({ width: lineLength, indent });
    return pipe(levelStyle, headingStyle, wrapperFn, block)(text);
  }

  hr(): string {
    const { lineLength, hrStyle, hrChar } = this.opts;
    return block(SEP + hrStyle(hrChar.repeat(lineLength - 2)) + SEP);
  }

  paragraph({ tokens }: Tokens.Paragraph): string {
    const text = this.parseTokens(tokens);
    const { lineLength, indent } = this.opts;
    const wrapperFn = wrapper({ width: lineLength, indent });
    return block(wrapperFn(text));
  }

  // COMPOUND

  html({ text }: { text: string }): string {
    return block(chalk.redBright('HTML not implemented'));
  }

  list({ items, ordered, start }: Tokens.List): string {
    const { listChar, listStyle } = this.opts;
    const body = items.map(item => this.listitem(item)).join('');
    let startNum = typeof start === 'number' ? start : 1;
    const mapper = ordered
      ? (line: string) => SEP + line.replace(LI, listStyle(startNum++))
      : (line: string) => SEP + line.replace(LI, listStyle(listChar));
    return EOL + body.split(EOL).filter(NOT_EMPTY).map(mapper).join(EOL) + EOL;
  }

  listitem({ tokens }: Tokens.ListItem): string {
    const text = this.parseTokens(tokens);
    const mapper = (line: string, index: number) =>
      index === 0 ? `${LI} ${line}` : `  ${line}`;
    return text.split(EOL).filter(NOT_EMPTY).map(mapper).join(EOL).trim() + EOL;
  }

  table({ header, rows }: Tokens.Table): string {
    const { lineLength, tableWordWrap: wordWrap } = this.opts;

    const head = header.map(cell => this.tablecell(cell));
    const tableRows = rows.map(row => row.map(cell => this.tablecell(cell)));

    // create table with no columns restrictions
    let table = new Table({ head, wordWrap });
    table.push(...tableRows);
    const output = table.toString();
    const length = output.search(EOL);
    if (length <= lineLength) {
      return output + EOL;
    }

    // re-create table with normalized columns
    const width = Math.ceil(lineLength / head.length);
    table = new Table({ head, wordWrap, colWidths: head.map(() => width) });
    table.push(...tableRows);
    return table.toString() + EOL;
  }

  tablerow({ text }: { text: string }): string {
    return asArray(text);
  }

  tablecell({ tokens }: Tokens.TableCell): string {
    const content = this.parseTokens(tokens);
    return asObject(content);
  }

  // helpers
}
