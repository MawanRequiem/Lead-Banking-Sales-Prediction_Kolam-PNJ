import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { isoToDate, toIso, formatDisplay } from '@/lib/date-utils'

export default function DateField({ value, onChange, placeholder = '', id }) {
  const date = isoToDate(value)

  return (
    <div className="relative">
      <Input
        id={id}
        value={formatDisplay(date)}
        placeholder={placeholder}
        readOnly
        className="pr-10"
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(d) => {
              onChange(toIso(d))
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
