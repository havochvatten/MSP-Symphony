import { Component, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { DecimalPipe } from '@angular/common';

interface SNodeExtra {
  nodeId: number;
  name: string;
}

interface SLinkExtra {
  source: number;
  target: number;
  value: number;
  uom: string;
}
type SNode = d3Sankey.SankeyNode<SNodeExtra, SLinkExtra>;
type SLink = d3Sankey.SankeyLink<SNodeExtra, SLinkExtra>;

export interface ChartData {
  nodes: SNode[];
  links: SLink[];
}

@Component({
  selector: 'app-pressure-chart',
  templateUrl: './pressure-chart.component.html',
  styleUrls: ['./pressure-chart.component.scss']
})
export class PressureChartComponent implements OnChanges {
  @Input() data?: ChartData;
  @Input() locale = 'en';

  constructor(private numberPipe: DecimalPipe) {}

  ngOnChanges() {
    if (this.data?.links.length && this.data?.nodes.length) {
      this.DrawChart();
    }
  }

  private DrawChart() {
    const svg = d3.select('#sankey'),
      width = +svg.attr('width'),
      height = +svg.attr('height');

    const formatNumber = (d: number) => this.numberPipe.transform(d, '1.1-2', this.locale),
      format = function(d: any) {
        return formatNumber(100 * d) + '%';
      },
      color = d3.scaleOrdinal(d3.schemeCategory10);

    const sankey = d3Sankey
      .sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 6]]);

    let link = svg
      .append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke', '#005073')
      .attr('stroke-opacity', 0.3)
      .selectAll('path');

    let node = svg
      .append('g')
      .attr('class', 'nodes')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('g');

    // @ts-ignore
    sankey.nodeId(d => d.nodeId);

    if (this.data) {
      sankey(this.data);

      // @ts-ignore
      link = link
        .data(this.data.links)
        .enter()
        .append('path')
        .attr('d', d3Sankey.sankeyLinkHorizontal())
        .attr('stroke-width', (d: any) => Math.max(1, d.width));

      link
        .append('title')
        .text((d: any) => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

      // @ts-ignore
      node = node
        .data(this.data.nodes)
        .enter()
        .append('g');

      node
        .append('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('height', (d: any) => d.y1 - d.y0)
        .attr('width', (d: any) => d.x1 - d.x0)
        .attr('fill', (d: any) => color(d.name.replace(/ .*/, '')))
        .attr('stroke', '#000');

      node
        .append('text')
        .attr('x', (d: any) => d.x0 - 8)
        .attr('y', (d: any) => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('id', (d: any) => 'a' + d.nodeId)
        .attr('fill', 'black')
        .attr('font-family', 'Roboto')
        .attr('text-anchor', 'end')
        .text((d: any) => d.name)
        .filter((d: any) => d.x0 < width / 2)
        .attr('x', (d: any) => d.x1 + 8)
        .attr('text-anchor', 'start');

      node.selectAll('text').each(function(d: any) {
        if (this) {
          const bbox = (this as SVGTextElement).getBBox();
          d3.select(`text#a${d.nodeId}`)
            .select(() => (this as Element).parentNode as d3.BaseType)
            .insert('rect', `#a${d.nodeId}`)
            .style('fill', '#fefefedd')
            .attr('x', bbox.x - 4)
            .attr('y', bbox.y - 2)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 4);
        }
      });

      node.append('title').text((d: any) => `${d.name}\n${format(d.value)}`);
    }
  }
}
