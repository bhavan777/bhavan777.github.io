export const getFlatDataFromTree = (data, depth = 0, parent) => {
  let res = [];
  const { id, title } = data;
  const visible = data.id === "root";
  const parentId = data.id === "root" ? "" : parent;
  const isOpen = false;
  res = [...res, { id, title, depth, visible, parentId, isOpen }];
  if (data.children.length) {
    const childData = data.children.map((c) =>
      getFlatDataFromTree(c, depth + 1, data.id)
    );
    res = [...res, ...childData];
  }
  return res.flat();
};
