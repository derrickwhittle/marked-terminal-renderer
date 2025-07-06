import { CliRendererOptions } from './types.js';
import { MarkedExtension } from './deps.js';
import { CliRenderer } from './renderer.js';
import { DARK, LIGHT } from './defaults.js';
import { asPlain } from './utils.js';

export * from './types.js';

// the default mode is dark
// this extension expose renderer only
export default function (opts?: Partial<CliRendererOptions>): MarkedExtension {
  // if options provided, merged with defaults
  // to make sure all options exists
  const options: CliRendererOptions = opts
    ? opts.mode === 'light'
      ? { ...LIGHT, ...opts }
      : { ...DARK, ...opts }
    : DARK;
  return {
    renderer: asPlain(new CliRenderer(options))
  };
}
