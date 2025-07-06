// Typescript example
import terminalRenderer from '../lib/index.js';
import { marked } from 'marked';
import { readFileSync } from 'fs';

marked.use(terminalRenderer());

const src = readFileSync(new URL('example.md', import.meta.url)).toString();

console.log(marked.parse(src));
