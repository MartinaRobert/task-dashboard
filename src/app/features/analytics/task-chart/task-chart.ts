import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

/** Presentational: draws a Chart.js chart from a simple list of label/value/color. */
@Component({
  selector: 'app-task-chart',
  imports: [BaseChartDirective],
  // Registered here (not in app.config) so Chart.js is only downloaded with the analytics page
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './task-chart.html',
  styles: '.chart { position: relative; height: 280px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskChart {
  readonly title = input.required<string>();
  readonly type = input<ChartType>('doughnut');
  readonly slices = input.required<ChartSlice[]>();

  protected readonly data = computed<ChartConfiguration['data']>(() => ({
    labels: this.slices().map((s) => s.label),
    datasets: [
      {
        data: this.slices().map((s) => s.value),
        backgroundColor: this.slices().map((s) => s.color),
        borderWidth: 0,
      },
    ],
  }));

  protected readonly options = computed<ChartConfiguration['options']>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: this.type() !== 'bar', position: 'bottom' } },
    scales: this.type() === 'bar' ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : {},
  }));
}
