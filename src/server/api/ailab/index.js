import Request from '../public/request';
import h2p from 'html2plaintext';
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const { post } = Request;

function mdToText(string){
  const html = md.render(string);
  return h2p(html);
}
// https://wiki.bytedance.net/display/DATA/Keyphrase+Extraction+API+Document
function extractKeyWords(payload = {}, $curUser, $req, $res) {
  payload.content = mdToText(payload.content);
  const res = post({
    url: 'http://lab-litg.bytedance.net/api/keyphrase_extraction/single',
    query: payload,
    timeout: 3000,
  }, {
    needHeaders: true
  }, $req, $res);
  return res;
}

export default {
  extractKeyWords,
};