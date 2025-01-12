import React from 'react'

import * as d3 from 'd3'
import { Dataset } from 'Types/Dataset'
import { DatasetRow } from 'Types/DatasetRow'
import FormVisualization from './FormVisualization'

type BarChartProps = {
  data : Dataset // Data to be taken in by the bar chart
}

export default function BarChart ({ data } : BarChartProps) {
  const getRegionLabel = (region : string) => {
    const regions = new Map<string, string>()
    regions.set('A', 'G. frontalis medius')
    regions.set('B', 'Gyrus praecentralis')
    regions.set('C', 'Occupitales')
    regions.set('D', 'G. temporalis medius')
    regions.set('E', 'G. supra marginalis')
    if (regions.has(region)) {
      return regions.get(region) as string
    } else {
      return ''
    }
  }

  const drawBarChart = (rootDOM : HTMLDivElement, data : DatasetRow[], condition : string) => {
    // Redraw the svg
    const filteredData = data.filter(row => row.Condition === condition).map(row => {
      return { Condition: row.Condition, Signal: row.Signal, Region: getRegionLabel(row.Region) } as DatasetRow
    })

    d3.select(rootDOM).selectAll('svg').remove()

    const margin = { top: 30, right: 30, bottom: 70, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    // append the svg object to the body of the page
    const svg = d3.select(rootDOM)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(filteredData.map(d => d.Region))
      .padding(0.2)

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .style('font-size', '10pt')
      .call(d3.axisBottom(x))

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 110])
      .range([height, 0])

    // A function that create / update the plot for a given variable:
    function update (data : DatasetRow[]) {
      const u = svg.selectAll('rect')
        .data(data)

      if (u) {
        u.join('rect')
          .transition()
          .duration(1000)
          .attr('x', d => {
            const result = x(d.Region)
            if (result) {
              return result
            } else {
              return null
            }
          })
          .attr('y', d => {
            const result = y(d.Signal)
            if (result) {
              return result
            } else {
              return null
            }
          })
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.Signal))
          .attr('stroke', '#69b3a2')
      }
    }

    // Initialize the plot with the first dataset
    update(filteredData)
  }

  return (
    <FormVisualization
      data={data}
      visualizationFunction={drawBarChart}
    />
  )
}
