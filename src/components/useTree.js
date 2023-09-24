import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const useTree = (chartID, data) => {
  const currentlyOpenNodes = useRef(new Set([]));
  const currentlyVisibleNodes = useRef(new Set(["root"]));
  let root = useRef(null);
  let svg = useRef(null);
  let ctr = useRef(null);
  let rects = useRef(null);
  let labels = useRef(null);
  const onNodeClick = (id) => {
    // highlightWord(id);
    debugger;
    if (currentlyVisibleNodes.current.has(id)) {
      const currentNode = data
        .descendants()
        .find((node) => node.data.id === id);
      if (!currentNode.data.children.length) {
        updateTree(id);
        return;
      }
      if (!currentlyOpenNodes.current.has(id)) {
        // set self as one of the open nodes
        currentlyOpenNodes.current.add(currentNode.data.id);

        // set all direct children of current node in VN
        currentNode.children.forEach((n) => {
          currentlyVisibleNodes.current.add(n.data.id);
        });
      } else {
        // unset self as one of the open nodes
        currentlyOpenNodes.current.delete(currentNode.data.id);

        // Remove all descendants from visible set(exclude self)
        const currentNodeDescendantIds = new Set(
          currentNode.descendants().map((n) => n.data.id)
        );
        currentNodeDescendantIds.delete(currentNode.data.id);
        currentNodeDescendantIds.forEach((key) => {
          currentlyVisibleNodes.current.delete(key);
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
      currentlyVisibleNodes.current.has(n.data.id)
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

  const drawTree = (id) => {
    if (!id) {
      return;
    }
    // Initialise Base Svg with dimensions
    root = d3.select(`#${id}`);
    svg = root.append("svg");
    svg.attr("width", root.style("width")).attr("height", root.style("height"));

    ctr = svg.append("g").attr("transform", "translate(50,50)");
    updateTree();
  };

  useEffect(() => {
    debugger;
    drawTree(chartID);
  }, []);
  return {};
};

export default useTree;
