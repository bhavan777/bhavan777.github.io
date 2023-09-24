import * as d3 from "d3";
import treeData from "../data.json";
const data = d3.hierarchy(treeData);

export default function wordCloudTree(chartID) {
  //  VN - all visible node ids
  let currentlyVisibleNodes = new Set(["root"]);
  // OS - all currently open node ids
  let currentlyOpenNodes = new Set();

  const wordArray = data
    .descendants()
    .map((n) => ({ id: n.data.id, text: n.data.title }));

  // SVG variables for accessing across component
  let root, svg, ctr, rects, labels, w_svg, randomXPositionArr;

  randomXPositionArr = wordArray.map((n) => Math.random() * 500);
  const onNodeClick = (id) => {
    highlightWord(id);
    debugger;
    if (currentlyVisibleNodes.has(id)) {
      const currentNode = data
        .descendants()
        .find((node) => node.data.id === id);
      if (!currentNode.data.children.length) {
        updateTree(id);
        return;
      }
      if (!currentlyOpenNodes.has(id)) {
        // set self as one of the open nodes
        currentlyOpenNodes.add(currentNode.data.id);

        // set all direct children of current node in VN
        currentNode.children.forEach((n) => {
          currentlyVisibleNodes.add(n.data.id);
        });
      } else {
        // unset self as one of the open nodes
        currentlyOpenNodes.delete(currentNode.data.id);

        // Remove all descendants from visible set(exclude self)
        const currentNodeDescendantIds = new Set(
          currentNode.descendants().map((n) => n.data.id)
        );
        currentNodeDescendantIds.delete(currentNode.data.id);
        currentNodeDescendantIds.forEach((key) => {
          currentlyVisibleNodes.delete(key);
        });
      }
    }
    updateTree(id);
  };
  const updateTree = (idToHighlight) => {
    let activeNodes = [];
    data.eachBefore((n) => {
      activeNodes.push(n);
    });
    activeNodes = activeNodes.filter((n) =>
      currentlyVisibleNodes.has(n.data.id)
    );
    rects = ctr.selectAll("rect").data(activeNodes, (d) => d.data.id);
    labels = ctr.selectAll("text").data(activeNodes, (d) => d.data.id);

    rects
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("y", (_, ind) => ind * 40 + 20)
            .attr("x", (d) => d.depth * 24 - 8)
            .attr("fill", "white")
            .attr("width", 100)
            .attr("height", 0)
            .attr("rx", (d) => (d.data.id === idToHighlight ? 0 : 4))
            .attr("fill-opacity", 0)
            .transition()
            .attr("width", 300)
            .attr("y", (_, ind) => ind * 40)
            .attr("x", (d) => d.depth * 24)
            .attr("height", 30)
            .attr("fill-opacity", 1)
            .style("cursor", "pointer")
            .attr("fill", (d) =>
              d.data.id === idToHighlight ? "black" : d3.schemeSet1[d.depth]
            ),
        (update) =>
          update
            .attr("height", 30)
            .attr("x", (d) => d.depth * 24)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40)
            .attr("width", 300)
            .attr("fill", (d) =>
              d.data.id === idToHighlight ? "black" : d3.schemeSet1[d.depth]
            ),
        (exit) =>
          exit
            .attr("y", (_, ind) => ind * 45)
            .attr("x", (d) => d.depth * 24 - 24)
            .attr("fill", (d) => d3.schemeSet1[d.depth])
            .attr("width", 0)
            .attr("height", 10)
            .attr("fill-opacity", 0)
            .remove()
      )
      .on("click", function (_, d) {
        onNodeClick(d.data.id);
      });
    rects.attr("height", 30);

    // labels.exit().remove();
    labels
      .join(
        (enter) =>
          enter
            .append("text")
            .merge(labels)
            .text((d) => {
              return `${
                d.data.children.length ? " ⊕  " : ""
              }${d.data.title.toLowerCase()}`;
            })
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("y", (_, ind) => ind * 40 + 40)
            .attr("fill", (d) =>
              d.data.id === idToHighlight ? "red" : "white"
            )
            .attr("font-weight", (d) =>
              d.data.id === idToHighlight ? 500 : 300
            )
            .attr("fill-opacity", 0)
            .transition()
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40 + 20)
            .style("cursor", "pointer")
            .attr("text-decoration", (d) =>
              d.data.id === idToHighlight ? "underline" : ""
            )
            .attr("font-size", (d) => (d.data.id === idToHighlight ? 18 : 16)),
        (update) =>
          update
            .attr("fill-opacity", 1)
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("y", (_, ind) => ind * 40 + 20)
            .transition()
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40 + 20)
            .attr("text-decoration", (d) =>
              d.data.id === idToHighlight ? "underline" : ""
            )
            .attr("font-size", (d) => (d.data.id === idToHighlight ? 18 : 16)),

        (exit) =>
          exit
            // .transition()
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40 + 20)
            .remove()
      )
      .on("click", function (_, d) {
        onNodeClick(d.data.id);
      });
  };

  const drawWordTree = (id) => {
    w_svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("width", window.innerWidth / 2 - 100)
      .attr("height", window.innerHeight)
      .append("g")
      .attr("transform", `translate(300,100)`);
    w_svg
      .selectAll("text")
      .data(wordArray)
      .join("text")
      .attr("fill", "black")
      .attr("font-size", (d, i) => 40)
      .attr("x", (_, i) => randomXPositionArr[i])
      .attr("y", (d, i) => i * 50)
      .attr("class", "text-capitalize")
      .text((d) => d.text.toLowerCase())
      .attr("cursor", "pointer")
      .on("click", function (e, d) {
        expandTreeUpTo(d.id);
        highlightWord(d.id);
      });
  };

  const highlightWord = (id) => {
    w_svg
      .selectAll("text")
      .data(wordArray)
      .join("text")
      .attr("fill", (d, i) => (id === d.id ? "red" : "black"))
      .attr("font-size", (d, i) => (id === d.id ? 50 : 40))
      .attr("x", (_, i) => randomXPositionArr[i])
      .attr("y", (d, i) => i * 50)
      .attr("class", "text-capitalize")
      .text((d) => d.text.toLowerCase())
      .attr("cursor", "pointer");
  };

  const expandTreeUpTo = (id) => {
    let node = data.descendants().find((n) => n.data.id === id);
    let siblings = node.parent.children.map((n) => n.data.id);
    let idsToAdd = [...node.path(data).map((n) => n.data.id), ...siblings];

    idsToAdd.forEach((nId) => {
      currentlyVisibleNodes.add(nId);
      // if (id !== nId) {
      //   currentlyOpenNodes.add(id);
      // }
    });
    updateTree(id);
    highlightWord(id);
  };

  // drawTree(chartID);

  drawWordTree(`word-${chartID}`);
}
