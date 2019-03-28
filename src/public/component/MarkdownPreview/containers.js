const container = require('markdown-it-container');

export default md => {
  md
    .use(...createContainer('tip', '提示'))
    .use(...createContainer('warning', '警告'))
    .use(...createContainer('danger', '注意'))
    // explicitly escape Vue syntax
    .use(container, 'v-pre', {
      render: (tokens, idx) => tokens[idx].nesting === 1
        ? '<div v-pre>\n'
        : '</div>\n'
    })
    .use(container, 'vue', {
      render: (tokens, idx) => tokens[idx].nesting === 1
        ? '<pre class="vue-container"><code>'
        : '</code></pre>'
    });
};

function createContainer (klass, defaultTitle) {
  return [container, klass, {
    render (tokens, idx) {
      const token = tokens[idx];
      const info = token.info.trim().slice(klass.length).trim();
      if (token.nesting === 1) {
        return `<div class="${klass} custom-block"><p class="custom-block-title">${info || defaultTitle}</p>\n`;
      } else {
        return '</div>\n';
      }
    }
  }];
}
