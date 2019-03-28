import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import highlight from './highlight';
import anchor from 'markdown-it-anchor';
import { anchorConfig } from './util';
import containersPlugin from './containers';
import highlightLines from './highlight-lines';
import style from './index.less';
import 'highlight.js/styles/github.css';

const md = new MarkdownIt({
  highlight,
  html: true
}).use(anchor, anchorConfig)
  .use(containersPlugin)
  .use(highlightLines);

class MarkDownPreview extends PureComponent {
  render() {
    return <div className={this.props.className + ' ' + style.markdownPreview} dangerouslySetInnerHTML={{ __html: md.render(this.props.markDownString) }}></div>;
  }
}
MarkDownPreview.propTypes = {
  markDownString: PropTypes.string,
  className: PropTypes.string,
};
MarkDownPreview.defaultProps = {
  markDownString: '',
  className: ''
};
export default MarkDownPreview;