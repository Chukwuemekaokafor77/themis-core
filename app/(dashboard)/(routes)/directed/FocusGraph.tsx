import React, { useCallback, useRef, useEffect, useState } from "react";
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d";
import data from "./data";
import Modal from 'react-modal';
import SpriteText from "three-spritetext";
const FocusGraph = () => {
  const fgRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
 
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = useCallback(
    (node) => {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      if (fgRef.current) {
        fgRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio
          },
          node,
          3000
        );
      }
    },
    [fgRef]
  );

  return (
    <div style={{ width: '50vw', height: '50vh', maxWidth: '100%' }}>
      
      <ForceGraph3D
        ref={fgRef}
        width={window.innerWidth * 0.8}
height={window.innerHeight * 0.9}
        graphData={data}
        nodeLabel="id"
        nodeAutoColorBy="group"
        onNodeClick={handleClick}
        backgroundColor="#ffffff"
        linkWidth={1}
        linkColor={() => 'black'}
        
        nodeColor={node => {
            if (node.group == 1) {
                return 'green'; // Color for nodes in groups 9 and up
            } else if (node.group ==2) {
                return 'blue'; // Color for nodes in groups 4 to 8
            } else if (node.group ==3) {
                return 'red'; // Color for nodes in groups 1 to 3
            } else {
                return 'grey'; // Default color for nodes outside these ranges or if no group defined
            }
        }}
        
        nodeThreeObject={node => {
            const sprite = new SpriteText(node.id);
            if (node.group == 1) {
                sprite.color = 'green'; // Color for nodes in group 1
            } else if (node.group == 2) {
                sprite.color = 'blue'; // Color for nodes in group 2
            } else if (node.group == 3) {
                sprite.color = 'red'; // Color for nodes in group 3
            } else {
                sprite.color = 'grey'; // Default color for nodes outside these ranges or if no group defined
            } // Change to desired color
            sprite.textHeight = 8; // Change to desired font size
            return sprite;
          }}
      />
      
    </div>
  );
};

export default FocusGraph;
