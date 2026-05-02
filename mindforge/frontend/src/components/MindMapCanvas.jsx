import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize, Edit2 } from 'lucide-react';

const MindMapCanvas = ({ data, onNodeEdit }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!data) return;

    const width = 1200;
    const height = 800;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define glow and arrow markers
    const defs = svg.append("defs");

    // Arrowhead marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Position of the arrow relative to the node
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#64748b")
      .style("stroke", "none");

    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");
    gRef.current = g;

    // Horizontal Tree Layout
    const tree = d3.tree().nodeSize([60, 350]);
    const root = d3.hierarchy(data);
    tree(root);

    // Center the tree vertically on the left (Adjusted X for longer titles)
    g.attr("transform", `translate(250, ${height / 2})`);


    // Links (Horizontal)
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("marker-end", "url(#arrowhead)")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Pill-shaped background for nodes
    node.append("rect")
      .attr("fill", "#ffffff")
      .attr("stroke", d => d.data.color || "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 15) // Rounded corners for pill shape
      .attr("ry", 15)
      .attr("x", d => d.children ? -120 : 0) // Adjust x position based on root/leaf
      .attr("y", -18)
      .attr("width", 120) // Fixed width or dynamic
      .attr("height", 36)
      .style("filter", "url(#glow)")
      .attr("class", "cursor-pointer transition-transform hover:scale-105 shadow-sm")
      .on("dblclick", (event, d) => {
        const newTitle = prompt("Edit node title:", d.data.title);
        if (newTitle && newTitle !== d.data.title) {
          if (onNodeEdit) onNodeEdit(d.data, newTitle);
        }
      });

    // Text rendering inside the rect
    const text = node.append("text")
      .attr("dy", "0.35em")
      .attr("x", d => d.children ? -60 : 60) // Center text in rect
      .attr("text-anchor", "middle")
      .attr("class", "text-[12px] font-bold tracking-tight pointer-events-none")
      .attr("fill", "#1e293b"); // Dark text for light background

    text.append("tspan").text(d => d.data.icon ? d.data.icon + " " : "");
    
    // Truncate text if too long
    text.append("tspan").text(d => {
      const title = d.data.title || "";
      return title.length > 15 ? title.substring(0, 15) + "..." : title;
    });

    // Tags (Optional, placed below)
    node.filter(d => d.data.tag)
      .append("text")
      .attr("dy", "2.5em")
      .attr("x", d => d.children ? -60 : 60)
      .attr("text-anchor", "middle")
      .attr("class", "text-[9px] font-bold fill-slate-500 uppercase tracking-wider")
      .text(d => d.data.tag);

    // Zoom setup
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Improved Fit View logic
    const fitView = () => {
      const bounds = g.node().getBBox();
      const parent = svg.node().viewBox.baseVal;
      const fullWidth = parent.width;
      const fullHeight = parent.height;
      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;

      if (width === 0 || height === 0) return;

      const scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

      svg.transition().duration(0).call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    };

    // Store functions for manual buttons and export
    svgRef.current.zoomIn = () => svg.transition().call(zoomBehavior.scaleBy, 1.3);
    svgRef.current.zoomOut = () => svg.transition().call(zoomBehavior.scaleBy, 0.7);
    svgRef.current.reset = () => svg.transition().call(zoomBehavior.transform, d3.zoomIdentity.translate(250, height / 2));

    svgRef.current.fitView = fitView;

    // Initial fit
    setTimeout(fitView, 100);

    // Global listener for export
    const handleExportFit = () => fitView();
    window.addEventListener('mindforge-fit-view', handleExportFit);
    return () => window.removeEventListener('mindforge-fit-view', handleExportFit);

  }, [data]);

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-transparent rounded-lg overflow-hidden relative">
      <svg id="mindmap-svg" ref={svgRef} viewBox="0 0 1200 800" className="w-full h-full"></svg>

      {/* Zoom Controls Overlay */}
      <div 
        data-html2canvas-ignore="true"
        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-1 md:gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 md:p-2 rounded-lg md:rounded-xl border border-slate-700 shadow-2xl z-10"
      >
        <button
          onClick={() => svgRef.current.zoomIn()}
          className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => svgRef.current.zoomOut()}
          className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <div className="h-px bg-slate-700 mx-2 my-1" />
        <button
          onClick={() => svgRef.current.reset()}
          className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          title="Reset View"
        >
          <Maximize size={20} />
        </button>
      </div>
    </div>
  );
};

export default MindMapCanvas;
