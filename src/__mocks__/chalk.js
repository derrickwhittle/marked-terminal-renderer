// Mock chalk for Jest tests
const mockChalk = (text) => text;

const methods = [
  'red', 'green', 'blue', 'yellow', 'magenta', 'cyan', 'white', 'gray', 'grey', 'black',
  'redBright', 'greenBright', 'blueBright', 'yellowBright', 'magentaBright', 'cyanBright', 'whiteBright', 'blackBright',
  'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden', 'strikethrough', 'visible',
  'bgRed', 'bgGreen', 'bgBlue', 'bgYellow', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgBlack',
  'bgRedBright', 'bgGreenBright', 'bgBlueBright', 'bgYellowBright', 'bgMagentaBright', 'bgCyanBright', 'bgWhiteBright', 'bgBlackBright',
  'bgGray', 'bgGrey'
];

// Add all methods to mockChalk and make them chainable
methods.forEach(method => {
  mockChalk[method] = mockChalk;
});

// Hex method
mockChalk.hex = (color) => mockChalk;

// Export as both default and named export
module.exports = mockChalk;
module.exports.default = mockChalk;