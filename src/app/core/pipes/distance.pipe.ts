import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'distance', standalone: true })
export class DistancePipe implements PipeTransform {
  transform(km: number): string {
    if (!km) return ''
    if (km < 1) return `${Math.round(km * 1000)}m`
    return `${km.toFixed(1)}km`
  }
}