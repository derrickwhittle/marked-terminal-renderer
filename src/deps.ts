import chalk, { Chalk } from 'chalk';
import Table from 'cli-table3';
import wrap, { IOptions } from 'word-wrap';
import { highlight } from 'cli-highlight';
import { Renderer, MarkedExtension } from 'marked';
import nodeEmoji from 'node-emoji';
const { emojify } = nodeEmoji;
export {
  Chalk,
  chalk,
  Renderer,
  Table,
  MarkedExtension,
  wrap,
  IOptions,
  emojify,
  highlight
};
