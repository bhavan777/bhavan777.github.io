import { select, hierarchy, schemeDark2 } from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import stopWordsArray from "../stopWords";

const Tree = ({ treeData, activeWord, setWords }) => {
  const [activeWordCloudId, setActiveWordCloudId] = useState("root");
  const [wordToIdMap, setWordToIdMap] = useState(null);
  const [visibleNodes, setVisibleNodes] = useState(["root"]);
  const [openNodes, setOpenNodes] = useState([]);
  const [highlightNodes, setHighlightNodes] = useState([]);
  const svgRef = useRef();
  const ctrRef = useRef(null);
  const ToolTipRef = useRef(null);
  const data = hierarchy(treeData);


  const createWordsToIdsMap = useCallback(
    (descendants = data.descendants()) => {
      const tempMap = {};
      const stopWords = new Set([...stopWordsArray]);

      // This is not optimized way, but here,
      // we are preparing a map of all words
      // from all nodes excluding any from stop words
      // to the corresponding node id that cotains the word

      descendants.forEach((node) =>
        node.data.description.split(" ").forEach((w) => {
          if (stopWords.has(w)) {
            return;
          }
          if (tempMap[w]) {
            tempMap[w].push(node.data.id);
          } else {
            tempMap[w] = [node.data.id];
          }
        })
      );
      setWordToIdMap(tempMap);
      // returning same map in this format to use to render word cloud
      // Array<{
      //   text: string (word)
      //   value: number (occurances)
      // }>
      const wordCloudData = Object.entries(tempMap).map(([text, keys]) => ({
        text,
        value: keys.length,
      }));
      return wordCloudData;
    },
    [data]
  );

  const resetState = () => {
    ctrRef.current?.selectAll("rect").remove();
    ctrRef.current?.selectAll("text").remove();
    setWordToIdMap(null);
    setVisibleNodes(["root"]);
    setOpenNodes([]);
    setHighlightNodes([]);
  };

  // Initialise svg base for rendering tree
  const initTree = () => {
    const svg = select(svgRef.current);
    svg
      .attr("width", svgRef.current.parentNode.clientWidth)
      .attr("height", window.innerHeight);

    resetState();

    ctrRef.current = svg.append("g").attr("transform", "translate(100,100)");
    ToolTipRef.current = select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  };

  //  Handle node click
  //  Open node if closed , close if already open
  const toggleNodeExpansion = useCallback(
    (_e, datum) => {
      setHighlightNodes([]);
      const id = datum.id;
      const currentNode = data.descendants().find((n) => n.data.id === id);

      if (id !== activeWordCloudId) {
        const wordsData = createWordsToIdsMap(currentNode.descendants());
        setWords(wordsData);
        setActiveWordCloudId(id);
      }

      if (!currentNode.data.children.length) {
        return;
      }
      if (visibleNodes.includes(id)) {
        if (!openNodes.includes(id)) {
          // since current node is not open
          // add current clicked node id to the
          // openNodes
          setOpenNodes([...new Set([...openNodes, id])]);
          // add current clicked node id and its
          // direct children to the visible nodes
          const childrenIds = currentNode.children.map((n) => n.data.id);
          setVisibleNodes([...new Set([...visibleNodes, ...childrenIds])]);
        } else {
          const descendantIds = currentNode
            .descendants()
            .filter((n) => n.data.id !== id)
            .map((n) => n.data.id);

          // Mark current node and all descendant nodes closed
          setOpenNodes(
            openNodes.filter((nId) => ![...descendantIds, id].includes(nId))
          );
          // mark all descendant of current node as not visible
          setVisibleNodes(
            visibleNodes.filter((nId) => !descendantIds.includes(nId))
          );
        }
      }
    },
    [
      openNodes,
      visibleNodes,
      data,
      activeWordCloudId,
      createWordsToIdsMap,
      setWords,
    ]
  );

  const renderNodes = useCallback(() => {
    const ctr = ctrRef.current;
    let nodes = [];
    data.eachBefore((n) => {
      nodes.push(n);
    });
    nodes = nodes
      .filter((n) => visibleNodes.includes(n.data.id))
      .map((node) => ({ ...node.data, depth: node.depth }));
    const rects = ctr.selectAll("rect").data(nodes, (d) => d.id);
    const labels = ctr.selectAll("text").data(nodes, (d) => d.id);

    rects
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("y", (_, ind) => ind * 40 + 10)
            .attr("x", (d) => d.depth * 24 - 8)
            .attr("fill", "white")
            .attr("width", 100)
            .attr("height", 0)
            .attr("rx", 4)
            .attr("fill-opacity", 0)
            .transition()
            .duration(400)
            .attr("width", svgRef.current.parentNode.clientWidth * 0.5)
            .attr("y", (_, ind) => ind * 40)
            .attr("x", (d) => d.depth * 24)
            .attr("height", 30)
            .attr("fill-opacity", 1)
            .style("cursor", "pointer")
            .attr("fill", (d) =>
              highlightNodes.includes(d.id) ? "white" : schemeDark2[d.depth]
            ),
        (update) =>
          update
            .attr("height", 30)
            .attr("x", (d) => d.depth * 24)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40)
            .attr("width", svgRef.current.parentNode.clientWidth * 0.5)
            .attr("fill", (d) =>
              highlightNodes.includes(d.id) ? "white" : schemeDark2[d.depth]
            ),
        (exit) =>
          exit
            .attr("y", (_, ind) => ind * 45)
            .attr("x", (d) => d.depth * 24 - 24)
            .attr("fill", (d) => schemeDark2[d.depth])
            .attr("width", 0)
            .attr("height", 10)
            .attr("fill-opacity", 0)
            .remove()
      )
      .on("click", toggleNodeExpansion)
      .on("mousemove", (e, d) => {
        ToolTipRef.current
          .style("opacity", 1)
          .html(d.description)
          .style("left", "50%")
          .style("transform", "translate(-100%,-50%)")
          .style("top", e.pageY + "px");
      })
      .on("mouseout", () => {
        ToolTipRef.current.style("opacity", 0);
      });

    labels
      .join(
        (enter) =>
          enter
            .append("text")
            .merge(labels)
            .text((d) => {
              return `${
                d.children.length
                  ? openNodes.includes(d.id)
                    ? " ⊖ "
                    : " ⊕ "
                  : ""
              }${d.title.toUpperCase()}${
                highlightNodes.includes(d.id) ? "★" : ""
              }`;
            })
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("y", (_, ind) => ind * 40 + 40)
            .attr("fill", (d) =>
              highlightNodes.includes(d.id) ? "red" : "white"
            )
            .attr("font-weight", (d) =>
              highlightNodes.includes(d.id) ? 600 : 300
            )
            .attr("fill-opacity", 0)
            .style("cursor", "pointer")
            .transition()
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40 + 20)
            .attr("text-decoration", (d) =>
              highlightNodes.includes(d.id) ? "underline" : ""
            )
            .attr("font-size", (d) =>
              highlightNodes.includes(d.id) ? 18 : 16
            ),
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
              highlightNodes.includes(d.id) ? "underline" : ""
            )
            .attr("font-size", (d) =>
              highlightNodes.includes(d.id) ? 18 : 16
            ),

        (exit) =>
          exit
            .attr("x", (d) => d.depth * 24 + 16)
            .attr("fill-opacity", 1)
            .attr("y", (_, ind) => ind * 40 + 20)
            .remove()
      )
      .on("click", toggleNodeExpansion);
    // eslint-disable-next-line
  }, [visibleNodes, data]);

  useEffect(() => {
    initTree();

    // create a map of unique words to id of the nodes
    // to be used to highlight the clicked word related nodes
    // and callback the word cloud data to be used in the parent
    const wordsData = createWordsToIdsMap(hierarchy(treeData).descendants());

    debugger;
    // we will set this state on mount for current state of
    // words and corresponding nodes they are part of
    // to highlight if some word is clicked
    setWords(wordsData);
    // eslint-disable-next-line
  }, [treeData]);

  useEffect(() => {
    renderNodes();
    // eslint-disable-next-line
  }, [visibleNodes, treeData]);

  const expandActiveWordNodes = (word) => {
    // 1. get nodes which has the word in its description and
    // store its ids in highlights state to highlight while rendering
    const idsToExpand = wordToIdMap[word];
    const nodesToExpand = data
      .descendants()
      .filter((node) => idsToExpand.includes(node.data.id));
    setHighlightNodes(idsToExpand);

    // 2. find all path node id from these
    // nodes to root to open all the paths
    const pathNodes = nodesToExpand.map((node) => node.path(data)).flat();
    const nodesToUpdate = pathNodes
      .map((node) => node.parent?.children.map((ch) => ch.data.id) ?? "root")
      .flat();

    // 3. mark all nodes which has children that are opening
    const leafPathNodes = nodesToExpand.map((n) => n.data.id);
    const allPathNodesWithChildrenIds = pathNodes
      .filter((node) => node.data.children.length)
      .filter((node) => !leafPathNodes.includes(node.data.id))
      .map((node) => node.data.id);
    setOpenNodes(allPathNodesWithChildrenIds);

    // 4. update all unique ids to be marked visible
    const updatedVisibleNodes = [...new Set([...nodesToUpdate])];
    setVisibleNodes(updatedVisibleNodes);
  };

  useEffect(() => {
    if (activeWord) {
      // Each time a word is clicked in the word cloud,
      // active word state is updated and this method to expand tree is called
      expandActiveWordNodes(activeWord);
    }
    // eslint-disable-next-line
  }, [activeWord]);

  return <svg ref={svgRef}></svg>;
};

export default Tree;
