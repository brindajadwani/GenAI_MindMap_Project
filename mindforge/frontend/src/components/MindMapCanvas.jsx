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

    node.append("circle")
      .attr("fill", d => d.data.color || "#c8a96e")
      .attr("r", d => d.depth === 0 ? 12 : 8)
      .style("filter", "url(#glow)")
      .attr("class", "cursor-pointer transition-transform hover:scale-125")
      .on("dblclick", (event, d) => {
        const newTitle = prompt("Edit node title:", d.data.title);
        if (newTitle && newTitle !== d.data.title) {
          if (onNodeEdit) onNodeEdit(d.data, newTitle);
        }
      });

    // Text rendering
    const text = node.append("text")
      .attr("dy", "0.35em")
      .attr("x", d => d.children ? -15 : 15)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .attr("class", "text-[14px] font-bold tracking-tight pointer-events-none drop-shadow-lg")
      .attr("fill", "#ffffff");

    text.append("tspan").text(d => d.data.icon ? d.data.icon + " " : "");
    text.append("tspan").text(d => d.data.title);

    // Tags
    node.filter(d => d.data.tag)
      .append("text")
      .attr("dy", "1.6em")
      .attr("x", d => d.children ? -15 : 15)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .attr("class", "text-[10px] font-black fill-brand-gold uppercase tracking-widest")
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
    const fitView = (duration = 0) => {
      let bounds;
      try {
        bounds = g.node().getBBox();
      } catch (e) {
        return; // getBBox can fail in some browsers if not rendered
      }
      
      let width = bounds.width;
      let height = bounds.height;
      let midX = bounds.x + width / 2;
      let midY = bounds.y + height / 2;

      // Fallback if dimensions are missing
      if (!width || !height || width === 0 || height === 0) {
        width = 600;
        height = 400;
        midX = 300;
        midY = 0;
      }

      const fullWidth = 1200;
      const fullHeight = 800;

      // Clamp scale to respect the [0.1, 5] zoomBehavior extent
      let scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
      scale = Math.max(0.1, Math.min(2.5, scale)); 

      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

      svg.transition().duration(duration).call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    };

    // Store functions for manual buttons and export
    svgRef.current.zoomIn = () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
    svgRef.current.zoomOut = () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
    svgRef.current.reset = () => fitView(750);

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
        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-1 md:gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 md:p-2 rounded-lg md:rounded-xl border border-slate-700 shadow-2xl z-30"
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
