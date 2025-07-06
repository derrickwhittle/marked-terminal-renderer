// Typescript example
import terminalRenderer from '../lib';
import { marked } from 'marked';
import { readFileSync } from 'fs';

marked.use(terminalRenderer());

const src = readFileSync(__dirname + 'example.md').toString();

console.log(marked.parse(src));
