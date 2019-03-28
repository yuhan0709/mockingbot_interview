export default {
  app: {
    'vadmin': {
      entryHtml: './src/app/vadmin/index.html',
      entryJs: './src/app/vadmin/index.js',
      matchPaths: [/^\/app/],
      // ssrEntry: './src/app/vadmin/ssr.js',
      whiteList: [/^\/static/, /^\/require-node/, /\/index.html$/, /^\/ip/, /^\/login/, /^\/logout/],
    },
  }
};