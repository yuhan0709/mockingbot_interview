export function getISOString(time, needMS = false) {
  let isoString = time;
  if (typeof time === 'object' && time instanceof Date) {
    isoString = time.toISOString();  // 使用ISO标准返回Date对象的字符串格式。
  }
  // 支持unix时间戳s or ms
  if (typeof time === 'number') {
    isoString = new Date(time * (Math.pow(10, 13 - String(time).length))).toISOString();
  }
  if (needMS) return isoString;
  return isoString.replace(/\.\d{3}/,'');
}