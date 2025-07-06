import { CliRenderer } from './renderer.js';
import { DARK } from './defaults.js';
import { marked } from 'marked';
import terminalRenderer from './index.js';

describe('renderer', () => {
  it('should create a cli renderer', () => {
    expect(new CliRenderer(DARK)).toBeTruthy();
  });

  describe('list item styling', () => {
    beforeEach(() => {
      marked.use(terminalRenderer());
    });

    it('should render strong text in list items', () => {
      const result = marked('- **bold text** in list');
      expect(result).toContain('bold text');
      expect(result).not.toContain('**bold text**');
    });

    it('should render italic text in list items', () => {
      const result = marked('- _italic text_ in list');
      expect(result).toContain('italic text');
      expect(result).not.toContain('_italic text_');
    });

    it('should render strikethrough text in list items', () => {
      const result = marked('- ~~strikethrough text~~ in list');
      expect(result).toContain('strikethrough text');
      expect(result).not.toContain('~~strikethrough text~~');
    });

    it('should render mixed inline styles in list items', () => {
      const result = marked('- **bold** and _italic_ and ~~strikethrough~~');
      expect(result).toContain('bold');
      expect(result).toContain('italic');
      expect(result).toContain('strikethrough');
      expect(result).not.toContain('**bold**');
      expect(result).not.toContain('_italic_');
      expect(result).not.toContain('~~strikethrough~~');
    });

    it('should render nested lists with styled text', () => {
      const result = marked(`- **Item 1**
  - _Nested item_
- ~~Item 2~~`);
      expect(result).toContain('Item 1');
      expect(result).toContain('Nested item');
      expect(result).toContain('Item 2');
      expect(result).not.toContain('**Item 1**');
      expect(result).not.toContain('_Nested item_');
      expect(result).not.toContain('~~Item 2~~');
    });

    it('should render ordered lists with styled text', () => {
      const result = marked(`1. **First item**
2. _Second item_`);
      expect(result).toContain('First item');
      expect(result).toContain('Second item');
      expect(result).not.toContain('**First item**');
      expect(result).not.toContain('_Second item_');
    });

    it('should render inline code in list items', () => {
      const result = marked('- Use `npm install` to install');
      expect(result).toContain('npm install');
      expect(result).not.toContain('`npm install`');
    });

    it('should handle complex example from documentation', () => {
      const result = marked(`- **/help** - Show help and available commands
- **/quit** (_/exit_) - Exit the REPL`);
      expect(result).toContain('/help');
      expect(result).toContain('/quit');
      expect(result).toContain('/exit');
      expect(result).not.toContain('**/help**');
      expect(result).not.toContain('**/quit**');
      expect(result).not.toContain('_/exit_');
    });
  });
});
