import moment from 'moment';

export function getZeroTime(time) {
  let now = moment(time).format('YYYY-MM-DD');
  let zero = moment(now).format('YYYY-MM-DD HH:mm:ss');
  return moment(zero);
}
