import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'riskColor', standalone: true })
export class RiskColorPipe implements PipeTransform {
  transform(score: number): string {
    if (score >= 70) return '#1D9E75'
    if (score >= 40) return '#E5A020'
    return '#D85A30'
  }
}