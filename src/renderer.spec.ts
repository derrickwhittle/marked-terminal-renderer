import { CliRenderer } from './renderer.js';
import { DARK } from './defaults.js';

describe('renderer', () => {
  it('should create a cli renderer', () => {
    expect(new CliRenderer(DARK)).toBeTruthy();
  });
});
