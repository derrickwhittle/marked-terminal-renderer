import { marked } from 'marked';
import terminalRenderer from './index.js';

describe('marked-terminal-renderer', () => {
  marked.use(terminalRenderer());

  it('simple sanity', () => {
    expect(marked.parse('example')).toBe('\nexample\n');
  });
});
