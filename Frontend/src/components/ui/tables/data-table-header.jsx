import React from 'react'

// This header intentionally does NOT provide sorting controls.
// Use the separate ViewOptions component to toggle column visibility.
export function DataTableColumnHeader({ title, className }) {
  return (
    <div className={className ? className : 'text-sm font-medium'}>
      {title}
    </div>
  )
}

export default DataTableColumnHeader
