export default function(name, funcName, params) {
  const aLink = document.createElement('a');
  aLink.download = name;
  aLink.target = '_blank';
  aLink.href = `/DownloadCsv?QueryParams=${JSON.stringify({ funcName, params })}`;
  aLink.click();
}