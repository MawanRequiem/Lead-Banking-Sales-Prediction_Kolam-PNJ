import React from 'react'
import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }) {
  if (!status) return null

  const className = (() => {
    switch (status) {
      case 'Dalam Panggilan':
        return 'bg-gray-100 text-gray-800'
      case 'Tersedia':
        return 'bg-green-100 text-green-800'
      case 'Assign':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-muted text-muted-foreground'
    }
  })()

  return <Badge className={className}>{status}</Badge>
}

export function CategoryBadge({ category }) {
  if (!category) return null

  const className = (() => {
    switch (String(category)) {
      case 'A':
        return 'bg-chart-1 text-white'
      case 'B':
        return 'bg-chart-2 text-white'
      case 'C':
        return 'bg-chart-3 text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  })()

  return <Badge className={className}>Grade {category}</Badge>
}

export default { StatusBadge, CategoryBadge }
