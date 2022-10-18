import { Component, Input, OnInit } from '@angular/core';
import { Report } from "@data/calculation/calculation.interfaces";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})

export class HistogramComponent implements OnInit {
  @Input() title?: string;
  @Input() report!: Report;
  @Input() locale = 'en';

  hasZeroes = false;

  dbins: number[][] = [];

  ngOnInit(): void {
    this.dbins = [this.report.histogram, this.report.histogram.slice()];
    this.dbins[1][0] += this.report.zeroes;
  }

  toggleHistogramRange(): void {
    this.hasZeroes = !this.hasZeroes;
  }
}
