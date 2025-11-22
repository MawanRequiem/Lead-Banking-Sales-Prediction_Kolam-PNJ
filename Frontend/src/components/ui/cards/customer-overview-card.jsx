import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Users, UserCheck, Monitor, ArrowUp, ArrowDown } from 'lucide-react'

function Metric({ Icon, title, value, change, changeDirection }) {
  const positive = changeDirection === 'up' || Number(change) > 0
  const changeClass = positive ? 'text-green-500' : 'text-destructive'

  return (
    <div className="flex-1 min-w-0 px-6 py-6 flex items-center gap-4">
      <div className="flex-shrink-0">
        {Icon ? <Icon className="h-8 w-8 text-muted-foreground" aria-hidden /> : null}
      </div>

      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold text-foreground mt-1">{value}</div>
        {typeof change !== 'undefined' ? (
          <div className={`text-xs mt-1 flex items-center gap-1 ${changeClass}`}>
            {positive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>
              {Math.abs(change)}% {positive ? 'this month' : 'this month'}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * CustomerOverviewCard
 *
 * UI-first card that shows three high-level metrics for the customer page:
 * - Total Customers
 * - Deposito Members
 * - Deposito Active
 *
 * Props:
 * - `data` optional object: { totalCustomers, totalChange, totalDirection, depositoMembers, depositoMembersChange, depositoMembersDirection, depositoActive, depositoActiveChange, depositoActiveDirection }
 * - `className` optional string
 *
 * The component renders reasonable mock fallback values when `data` is not provided so it can be dropped into the dashboard immediately.
 */
export default function CustomerOverviewCard({ data = null, className = '' }) {
  const defaults = {
    totalCustomers: 5423,
    totalChange: 16,
    totalDirection: 'up',
    depositoMembers: 1893,
    depositoMembersChange: -1,
    depositoMembersDirection: 'down',
    depositoActive: 189,
    depositoActiveChange: 0,
    depositoActiveDirection: 'up',
  }

  const merged = Object.assign({}, defaults, data || {})

  return (
    <Card className={cn('p-0 overflow-hidden rounded-2xl', className)}>
      <CardContent className="p-0">
        <div className="flex items-stretch divide-x divide-border bg-card text-card-foreground">
          <Metric
            Icon={Users}
            title="Total Customers"
            value={merged.totalCustomers}
            change={merged.totalChange}
            changeDirection={merged.totalDirection}
          />

          <Metric
            Icon={UserCheck}
            title="Deposito Members"
            value={merged.depositoMembers}
            change={merged.depositoMembersChange}
            changeDirection={merged.depositoMembersDirection}
          />

          <Metric
            Icon={Monitor}
            title="Deposito Active"
            value={merged.depositoActive}
            change={merged.depositoActiveChange}
            changeDirection={merged.depositoActiveDirection}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/* Usage example:
import CustomerOverviewCard from '@/components/ui/cards/customer-overview-card'

<CustomerOverviewCard
  data={{
    totalCustomers: 5423,
    totalChange: 16,
    totalDirection: 'up',
    depositoMembers: 1893,
    depositoMembersChange: -1,
    depositoMembersDirection: 'down',
    depositoActive: 189,
    depositoActiveChange: 0,
  }}
  className="my-4"
/>

Notes:
- This is a presentational component. For real data, pass a `data` prop or wire a hook (react-query) in the parent.
- You mentioned creating a new table. That's fine — keep the new table component separate (e.g. `src/components/ui/tables/assignment-overview-table.jsx`) to avoid conflicts with `assignment-table`.
*/
