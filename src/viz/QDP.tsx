import React, { memo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { primaryColor } from '../util';

interface QuantileDotPlotProps {
  buckets: [string, number][];
  scale: number;
}

const QuantileDotPlot: React.FC<QuantileDotPlotProps> = memo(({ buckets, scale }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const cellSize = 8;
    const height = cellSize * scale;
    const width = cellSize * buckets.length;
    const margin = { top: 0, bottom: 42 };

    const data: { i: number; j: number }[] = [];
    const xLabels: string[] = [];
    const bucketIndexMap = new Map<string, number>();

    buckets.forEach(([minute, count], i) => {
      bucketIndexMap.set(minute, i);
      xLabels.push(minute);
      for (let j = 0; j < count; j++) {
        data.push({ i, j });
      }
    });

    svg.attr('width', width)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'transparent');

    const tickMap = buckets.reduce<{ last: string, n: number, ticks: [number, string][] }>((acc, [val]) => {
      if (val !== acc.last && (val[val.length - 1] === '0' || val[val.length - 1] === '5')) {
        acc.ticks.push([acc.n, val]);
      }
      acc.last = val;
      acc.n++;
      return acc;
    }, { last: '', n: 0, ticks: [] });

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => d.i * cellSize + cellSize / 2)
      .attr('cy', d => (scale - 1 - d.j) * cellSize + cellSize / 2 + margin.top)
      .attr('r', cellSize * 0.45)
      .attr('fill', 'pink');

    const gTicks = svg.insert('g', 'circle');

    tickMap.ticks.forEach(([i, label]) => {
      const x = i * cellSize + cellSize / 2;
      gTicks.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', margin.top)
        .attr('y2', height + margin.top)
        .attr('stroke', primaryColor)
        .attr('stroke-width', 1.5);

      gTicks.append('text')
        .attr('x', x)
        .attr('y', height + margin.top + 12)
        .attr('transform', `rotate(-45, ${x}, ${height + margin.top + 12})`)
        .attr('text-anchor', 'end')
        .attr('fill', primaryColor)
        .style('font-size', '1em')
        .style('font-weight', 'bold')
        .text(label);

    });

    svg.append('defs')
      .append('filter')
        .attr('id', 'glow') // was blur-everything
      .append('feGaussianBlur')
        .attr('stdDeviation', 4)
        .attr('result', 'blur');

    svg.select('filter#glow') // matches the ID above
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
        .attr('in', d => d);

    svg.attr('filter', 'url(#glow)');

  }, [buckets, scale]);

  return <svg ref={ref} />;
});

export default QuantileDotPlot;
