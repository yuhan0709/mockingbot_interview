import querystring from 'querystring';
export default function parseSearch(search = window.location.search) {
  const s = search.replace('?', '');
  return querystring.parse(s);
}