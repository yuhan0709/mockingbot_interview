import { TreeSelect } from 'antd';

export const treeProps = {
  treeCheckable: true,
  treeDefaultExpandAll: true,
  showCheckedStrategy: TreeSelect.SHOW_PARENT,
  style: {
    width: 250,
    marginRight: '15px',
    marginBottom: '10px'
  },
  dropdownStyle: {
    maxHeight: 400,
    overflow: 'auto'
  },
  dropdownClassName: 'statistic-tree-dropdown',
  treeNodeFilterProp: 'title'
};

export const getData = (dataSource = []) => {
  let data = [];
  let maxNodes = [];
  dataSource.forEach(item => {
    const Vender = item.Vender;
    item.Statistics.forEach(s => {
      data.push({
        Vender,
        ...s
      });
      // 找峰值点
      if (item.Peak === s.Value){
        maxNodes.push({
          Vender,
          ...s
        });
      }
    });
  });
  return {
    data,
    maxNodes
  };
};