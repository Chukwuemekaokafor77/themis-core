"use client";
import { use, useEffect, useRef } from "react";
import { forceDirectedGraph } from "./forceGraph";

const SecondChart = ({ data }) => {
    let svgRef = useRef(null)

    useEffect(() => {
        forceDirectedGraph(
            data,
            svgRef.current
        )
    },[])

    return <svg ref={svgRef} />
}

export default SecondChart