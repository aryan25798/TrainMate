import { Pipe, PipeTransform } from '@angular/core';

export type StatusType = 
  | 'ASSIGNED' 
  | 'UNASSIGNED' 
  | 'PENDING' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'PROCESSING'
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'AT_CAPACITY';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string, type: 'class' | 'label' = 'class'): string {
    const normalizedStatus = status?.toUpperCase();
    
    if (type === 'class') {
      switch (normalizedStatus) {
        case 'ASSIGNED': return 'badge-assigned';
        case 'UNASSIGNED': return 'badge-unassigned';
        case 'ACTIVE': return 'badge-active';
        case 'COMPLETED': return 'badge-completed';
        case 'CANCELLED': return 'badge-secondary';
        case 'PENDING': return 'badge-pending';
        case 'PROCESSING': return 'badge-processing';
        case 'AVAILABLE': return 'badge-assigned';
        case 'UNAVAILABLE': return 'badge-unassigned';
        case 'AT_CAPACITY': return 'badge-warning';
        default: return 'badge-secondary';
      }
    }
    
    // Return label (for display purposes)
    return normalizedStatus || 'Unknown';
  }
}