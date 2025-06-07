import React, { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { primaryColor } from '../util';

export type DepartureProb = [Date, number];
type DeparturePlotProps = {
  name: string;
  probs: DepartureProb[];
  width?: number;
  height?: number;
};

const DeparturePlot: React.FC<DeparturePlotProps> = memo(
  ({ name, probs, width = 600, height = 250 }) => {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (!ref.current) return;
      const svg = d3.select(ref.current);
      svg.selectAll('*').remove();

      const margin = { top: 5, right: 5, bottom: 45, left: 35 };
      const w = width - margin.left - margin.right;
      const h = height - margin.top - margin.bottom;

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(probs, d => d[0]) as [Date, Date])
        .range([0, w]);

      const yScale = d3.scaleLinear().domain([0, 1.03]).range([h, 0]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const tickDates = probs
        .map(d => d[0])
        .filter(d => d.getMinutes() % 5 === 0);

      g.append('g')
        .attr('transform', `translate(0,${h})`)
        .call(
          d3
            .axisBottom<Date>(xScale)
            .tickValues(tickDates)
            .tickFormat(d =>
              d.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }) as unknown as string,
            ),
        )
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('font-size', '1.2em')
        .attr('transform', `rotate(-20)`);

      g.append('g')
        .call(
          d3
            .axisLeft<number>(yScale)
            .tickValues([0.5, 0.8, 0.95])
            .tickFormat(d => (d === 1 ? '' : `${(d * 100).toFixed(0)}%`)),
        )
        .selectAll('text')
        .attr('font-size', '1.2em');

      g.append('path')
        .datum(probs)
        .attr('fill', 'none')
        .attr('stroke', 'pink')
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          d3
            .line<DepartureProb>()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1])),
        );

      g.selectAll('circle')
        .data(probs)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 3)
        .attr('fill', 'pink');

      svg
        .append('text')
        .attr('x', width * 0.7)
        .attr('y', height * 0.2)
        .attr('text-anchor', 'end')
        .attr('font-size', '1em')
        .attr('fill', primaryColor)
        .text(name);
    }, [name, probs, width, height]);

    return <svg ref={ref} width={width} height={height} />;
  },
);

export default DeparturePlot;
