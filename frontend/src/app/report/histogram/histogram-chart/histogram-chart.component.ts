import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DecimalPipe } from "@angular/common";
import { formatPercentage } from "@data/calculation/calculation.util";

@Component({
  selector: 'app-histogram-chart',
  templateUrl: './histogram-chart.component.html',
  styleUrls: ['./histogram-chart.component.scss']
})

export class HistogramChartComponent implements OnInit, OnChanges {
  @Input() bins: number[] = []
  @Input() reportMax!: number;
  @Input() inclusive = false;
  @Input() locale = 'en';
  @Input() algorithm = '';

  readonly leftMargin = 184;
  readonly cHeight     = 800;
  readonly topMargin   = 20;

  segments: Segment[] = [];
  binInfo: BinInfo[] = [];
  xlabels: [number, number][] = [];

  private readonly chartWidth  = 1200
  private readonly chartHeight = 864;
  private readonly binWidth    = 10;

  private max         = 0;
  private bmax        = 0;
  private binSz       = 0;
  private isRarityAdjusted = false;

  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit(): void {

    this.bmax = Math.max(...this.bins);
    this.binSz = this.reportMax / 100;
    this.isRarityAdjusted = this.algorithm === 'RarityAdjustedCumulativeImpact';

    const count = this.bins.reduce((a, b) => a + b),
          ystep =       // suitable vertical measure interval
            this.bmax < 10 ? 1 :
            this.bmax < 30 ? 5 :
            this.bmax < 100 ? 10 :
            this.bmax < 1000 ? 50 :
            this.bmax < 3000 ? 100 :
            this.bmax < 10000 ? 500 :
            this.bmax < 20000 ? 1000 :
            this.bmax < 100000 ? 5000 :
            this.bmax < 300000 ? 10000 :
            this.bmax < 1000000 ? 100000 :
            500000;

    let acc = this.bins[0];

    this.max = this.bmax < 10 ? 10 :
      (Math.trunc(this.bmax / ystep) + 1) * ystep;

    this.binInfo = this.bins.map((b, ix) => {
      acc += b;
      return this.makeInfo(ix, acc, count);
    });

    this.binInfo.push(this.makeInfo(100, acc, count));

    this.segments = [...Array(Math.ceil(this.max / ystep)).keys()]
      .map((v) => {
        const yc = v * ystep;
        return new Segment(
          this.leftMargin - this.binWidth * 3,
          this.topMargin + this.cHeight * (1 - yc / this.max),
          this.binWidth * 104, yc)
    });

    this.xlabels = [...Array(5).keys()].map(
                    (v) => [
                      ((this.leftMargin - this.binWidth * 1.5) +
                      ((v + 1) * (this.binWidth * 20))),
                      this.binInfo[(v + 1) * 20 - 1].middle
                    ]);

    this.xlabels.unshift([this.leftMargin - (this.binWidth / 2), this.binInfo[0].middle]);
  }

  chartViewBox() {
    return '0 0 ' + this.chartWidth + ' ' + this.chartHeight
  };

  phDraw(ix : number, info: boolean):string {
    const v = info ? 1 : this.bins[ix] / this.max,
      x = this.leftMargin - this.binWidth + ix * this.binWidth,
      y = this.topMargin + this.cHeight * (1 - v);
    return ['M', x, y,
      'h', info ? this.binWidth : this.binWidth * 0.85,
      'V', this.cHeight + this.topMargin,
      'H', x, 'Z'].join(' ');
  }

  phRed(ix : number) {
    // Color gradient from dark blue (#00001c) to matte red (#971c1c)
    // The range is deliberately chosen to appear distinct from the
    // rainbow type gradient used for the raster image.

    const r = ix > 27 ? Math.round(ix * 1.26 + 27) : ix,
      g = ix > 27 ? 28 : ix,
      b = ix > 27 ? 28 : 27 + (27 - ix);
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }

  makeInfo(binIndex: number, acc: number, count: number) {
    // "Middle number": arbitrarily prefer an integer value when reasonable
    // Actual values may be expected to be discrete
    const middle = binIndex * this.binSz + (this.binSz / 2);
    return new BinInfo(this.decimalPipe.transform(binIndex * this.binSz, '1.2-5', this.locale) || '',
                        acc, this.isRarityAdjusted || this.reportMax < 200 ? middle : Math.round(middle), count, this.locale)
  }

  ngOnChanges(): void {
    this.ngOnInit();
  }
}

class Segment {
  y: number;
  value: number;
  draw: string;

  constructor(x: number, y:number, w:number, value:number) {
    this.y = y;
    this.value = value;
    this.draw = ['M', x, y, 'h', w].join(' ');
  }
}

class BinInfo {
  lowerBound: string;
  cumulativeQuantity: string;
  middle: number;

  constructor(lowerBound: string, cQuantity: number, middle: number, count: number, locale: string) {
    this.lowerBound = lowerBound;
    this.middle = middle;
    this.cumulativeQuantity = formatPercentage(cQuantity / count, 3, locale);
  }
}
