export const colFormat = (title, key, render, rest) => {
  const res = {
    title: title,
    dataIndex: key,
    key: key,
    ...rest,
  };
  if (render) {
    res['render'] = render;
  }
  return res;
};
