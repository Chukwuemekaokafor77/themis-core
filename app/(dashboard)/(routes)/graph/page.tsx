"use client";
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NetworkDiagramAndSliders } from './NetworkDiagramAndSliders';

const Page = () => {
  return (<NetworkDiagramAndSliders width={500} height={800} />);
}
export default Page;
// Extended node and link interfaces to accommodate D3 modifications
// interface Node extends d3.SimulationNodeDatum {
//   id: string;
// }

// interface D3Node extends Node {
//   x: number;
//   y: number;
// }

// interface Link {
//   source: string | Node;
//   target: string | Node;
// }

// interface D3Link {
//   source: D3Node;
//   target: D3Node;
// }

// const DirectedGraph = ({ nodes, links }: { nodes: Node[], links: Link[] }) => {
//   const svgRef = useRef<SVGSVGElement>(null);

//   useEffect(() => {
//     if (!svgRef.current || !nodes || !Array.isArray(nodes) || !links || !Array.isArray(links)) return;

//     // Convert to D3 specific node and link types
//     const d3nodes: D3Node[] = nodes.map(d => ({ ...d, x: 0, y: 0 }));
//     const d3links: D3Link[] = links.map(l => ({
//       source: d3nodes.find(n => n.id === (typeof l.source === 'object' ? l.source.id : l.source)) as D3Node,
//       target: d3nodes.find(n => n.id === (typeof l.target === 'object' ? l.target.id : l.target)) as D3Node
//     }));

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = +svg.attr('width');
//     const height = +svg.attr('height');

//     // Setup zoom and pan
//     const g = svg.append('g');
//     const zoom = d3.zoom<SVGSVGElement, unknown>()
//       .on('zoom', (event) => {
//         g.attr('transform', event.transform);
//       });
//     svg.call(zoom);

//     // Setup simulation
//     const simulation = d3.forceSimulation(d3nodes)
//       .force('link', d3.forceLink<D3Node, D3Link>(d3links).id((d: D3Node) => d.id))
//       .force('charge', d3.forceManyBody())
//       .force('center', d3.forceCenter(width / 2, height / 2));

//     const link = g.append('g')
//       .attr('class', 'links')
//       .selectAll('line')
//       .data(d3links)
//       .enter().append('line')
//       .attr('stroke-width', 2)
//       .style('stroke', 'black');

//     const node = g.append('g')
//       .attr('class', 'nodes')
//       .selectAll('circle')
//       .data(d3nodes)
//       .enter().append('circle')
//       .attr('r', 10)
//       .style('fill', 'blue')
//       .call(d3.drag<SVGCircleElement, D3Node>()
//             .on("start", dragstarted)
//             .on("drag", dragged)
//             .on("end", dragended))
//       .on('mouseover', function() { d3.select(this).transition().attr('r', 15); })
//       .on('mouseout', function() { d3.select(this).transition().attr('r', 10); })
//       .append('title') // Tooltip showing the node ID
//       .text(d => d.id);

//     // Define drag behavior
//     function dragstarted(event: d3.D3DragEvent<SVGCircleElement, D3Node, unknown>, d: D3Node) {
//       if (!event.active) simulation.alphaTarget(0.3).restart();
//       d.fx = d.x;
//       d.fy = d.y;
//     }

//     function dragged(event: d3.D3DragEvent<SVGCircleElement, D3Node, unknown>, d: D3Node) {
//       d.fx = event.x;
//       d.fy = event.y;
//     }

//     function dragended(event: d3.D3DragEvent<SVGCircleElement, D3Node, unknown>, d: D3Node) {
//       if (!event.active) simulation.alphaTarget(0);
//       d.fx = null;
//       d.fy = null;
//     }

//     // Update positions on each tick
//     simulation.on('tick', () => {
//       link.attr('x1', d => d.source.x)
//           .attr('y1', d => d.source.y)
//           .attr('x2', d => d.target.x)
//           .attr('y2', d => d.target.y);

//       node.attr('cx', d => d.x)
//           .attr('cy', d => d.y);
//     });
//   }, [nodes, links]);

//   return <svg ref={svgRef} width="600" height="600"></svg>;
// };

// export default DirectedGraph;
