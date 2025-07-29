import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface OutcomesData {
  state: string;
  value: number;
}

interface USMapD3Props {
  data: OutcomesData[];
  width?: number;
  height?: number;
}

const USMapD3: React.FC<USMapD3Props> = ({ 
  data, 
  width = 800, 
  height = 500 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Create projection
    const projection = d3.geoAlbersUsa()
      .scale(width * 1.1)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create data map for quick lookup
    const dataMap = new Map<string, number>();
    data.forEach(d => {
      // Map state abbreviations to full names for matching with GeoJSON
      const stateNameMap: Record<string, string> = {
        'CA': 'California',
        'NY': 'New York',
        'TX': 'Texas',
        'WA': 'Washington',
        'FL': 'Florida',
        'IL': 'Illinois',
        'MA': 'Massachusetts',
        'OH': 'Ohio',
        'PA': 'Pennsylvania',
        'IN': 'Indiana'
      };
      const fullName = stateNameMap[d.state] || d.state;
      dataMap.set(fullName, d.value);
    });

    // Get min/max values for color scale
    const values = Array.from(dataMap.values());
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Create color scale using brand colors
    const colorScale = d3.scaleSequential<string>()
      .domain([minValue, maxValue])
      .interpolator(d3.interpolateRgb('#ffffff', '#8E6F3E'));

    // Load and display the US states
    d3.json('/us-states.json').then((geoData: any) => {
      if (!geoData || !geoData.features) return;

      // Draw states
      svg.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', (d: any) => {
          const stateName = d.properties.NAME;
          const value = dataMap.get(stateName);
          return value ? colorScale(value) : '#fff';
        })
        .attr('stroke', '#C4BFC0')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d: any) {
          const stateName = d.properties.NAME;
          const value = dataMap.get(stateName);
          
          if (value) {
            // Highlight state
            d3.select(this).attr('stroke-width', 2);
            
            // Create tooltip
            const tooltip = d3.select('body').append('div')
              .attr('class', 'tooltip')
              .style('position', 'absolute')
              .style('background', 'white')
              .style('color', 'black')
              .style('padding', '8px 12px')
              .style('border-radius', '4px')
              .style('font-family', 'Acumin Pro')
              .style('font-size', '14px')
              .style('pointer-events', 'none')
              .style('z-index', '1000')
              .style('opacity', 0)
              .style('box-shadow', '0 2px 8px rgba(0,0,0,0.2)');

            tooltip.transition()
              .duration(200)
              .style('opacity', 1);

            tooltip.html(`<strong>${stateName}</strong><br/>Alumni: ${value}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px');
          }
        })
        .on('mousemove', function(event) {
          d3.select('.tooltip')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          // Remove highlight
          d3.select(this).attr('stroke-width', 1);
          
          // Remove tooltip
          d3.select('.tooltip').remove();
        });
      // Add legend
      const legendWidth = 200;
      const legendHeight = 10;
      const legendX = width - legendWidth - 20;
      const legendY = height - 40;

      // Create gradient for legend
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', 'legend-gradient');

      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const value = minValue + (maxValue - minValue) * (i / steps);
        linearGradient.append('stop')
          .attr('offset', `${(i / steps) * 100}%`)
          .attr('stop-color', colorScale(value));
      }

      // Legend rectangle
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)')
        .style('stroke', '#C4BFC0')
        .style('stroke-width', 1);

      // Legend labels
      svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY - 5)
        .style('font-family', 'Acumin Pro')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(minValue.toString());

      svg.append('text')
        .attr('x', legendX + legendWidth)
        .attr('y', legendY - 5)
        .attr('text-anchor', 'end')
        .style('font-family', 'Acumin Pro')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(maxValue.toString());

      svg.append('text')
        .attr('x', legendX + legendWidth / 2)
        .attr('y', legendY + legendHeight + 20)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Acumin Pro')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text('Number of Alumni');
    }).catch(error => {
      console.error('Error loading US states data:', error);
    });

    // Cleanup function
    return () => {
      d3.select('.tooltip').remove();
    };
  }, [data, width, height]);

  return (
    <div style={{ 
      width: '100%', 
      height: height, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#ffffff',
      borderRadius: 8,
      position: 'relative'
    }}>
      <svg 
        ref={svgRef}
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
};

export default USMapD3;
