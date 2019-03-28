import slugify from './slugify';

export const anchorConfig = Object.assign({
  level: [2,3],
  slugify,
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '#'
});