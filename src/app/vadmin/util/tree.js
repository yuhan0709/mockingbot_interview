function lineToTree(lineData, key = 'DocumentID', parentKey = 'ParentID', childrenKey = 'children') {
  let data = lineData.map(e => Object.assign({}, e)),
    nodeMap = new Map(),
    tree = [];

  //先做一个 value 和 data[i] 的映射
  data.forEach(node => {
    nodeMap.set(node[key], node);
  });

  data.forEach(node => {
    let parent = nodeMap.get(node[parentKey]);
    if (parent != null) {
      !parent[childrenKey] && (parent[childrenKey] = []);
      parent[childrenKey].push(node);
    } else {
      tree.push(node);
    }
  });
  return tree;
}

export default {
  lineToTree
};