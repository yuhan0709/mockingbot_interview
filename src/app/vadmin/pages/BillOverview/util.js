import moment from 'moment';
export function formatCostValue(type, value = 0) {
  return Number(value).toLocaleString();
}
export function htmlContent(title, items) {
  let html = '<div class="g2-tooltip">';
  let titleDom = '<div class="g2-tooltip-title" style="margin-bottom: 4px;">' + moment(title).format('YYYY-MM') + '</div>';
  let listDom = '<ul class="g2-tooltip-list">';

  items.sort((a, b) => b.value - a.value);
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    const { Key, Value,Detail,index, color } = item;
    let itemDom = `<li data-index=${index}>
      <span style="background-color:${color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
      ${Key === 'cost' ? '消费额' : Key}：${Value.toFixed ? Value.toFixed(2) : Value} 元
      </li>`;
    listDom += itemDom;
    if (Detail){
      const detailDom = `<div><span style="background-color:black;width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;box-shadow: 0px 0px 2px 5px rgba(0,0,0,.2);"></span>${Detail}</div>`;
      listDom += detailDom;
    }
  }

  listDom += '</ul>';
  return html + titleDom + listDom + '</div>';
}