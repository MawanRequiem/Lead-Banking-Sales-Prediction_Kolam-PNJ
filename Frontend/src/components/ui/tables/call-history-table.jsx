import React, { useState, useMemo } from 'react'
import DataTable from '@/components/ui/tables/data-table'
import DataTableViewOptions from './data-table-view-options'
import { Button } from '@/components/ui/button'
import ExportDialog from '@/components/ui/dialogs/export-dialog'
import useCallHistory from '@/hooks/useCallHistory'
import FilterDropdown from '../dropdown/filter-dropdown'
import CallNoteDialog from '@/components/ui/dialogs/call-note-dialog'
import { CategoryBadge } from '@/components/ui/badges'

const historyColumns = (onOpenNote) => [
  { accessorKey: 'id', header: 'No Penawaran' },
  { accessorKey: 'time', header: 'Tanggal' },
  { accessorKey: 'namaNasabah', header: 'Nama Nasabah' },
  { accessorKey: 'result', header: 'Hasil Telepon' },
  { 
    accessorKey: 'grade', header: 'Kategori',
    cell: ({ row }) => <CategoryBadge category={row.original.grade} />,
  },
  {
    id: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onOpenNote(row.original)}>Lihat</Button>
      </div>
    ),
  },
]

export default function CallHistoryTable() {
  const [openExport, setOpenExport] = useState(false)
  const [filters, setFilters] = useState({ from: null, to: null, grade: 'all', status: 'any', keyword: '' })
  const [selectedCall, setSelectedCall] = useState(null)
  const [openNote, setOpenNote] = useState(false)

  const { data, loading } = useCallHistory()

  const cols = useMemo(() => historyColumns((call) => { setSelectedCall(call); setOpenNote(true) }), [])

  function applyFilter(payload) {
    setFilters(payload)
  }

  const toolbarRight = (
    <>
      <FilterDropdown className="mr-2" onApply={applyFilter} />
      <Button onClick={() => setOpenExport(true)}>Export</Button>
    </>
  )

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      if (filters.keyword) {
        const kw = String(filters.keyword).toLowerCase()
        const agent = String(item.agent || '').toLowerCase()
        const nama = String(item.namaNasabah || '').toLowerCase()
        if (!agent.includes(kw) && !nama.includes(kw)) return false
      }

      if (filters.from) {
        const fromD = new Date(filters.from)
        const itemD = new Date(item.time)
        if (isNaN(itemD.getTime()) || itemD < fromD) return false
      }
      if (filters.to) {
        const toD = new Date(filters.to)
        const itemD = new Date(item.time)
        if (isNaN(itemD.getTime()) || itemD > toD) return false
      }

      if (filters.grade && filters.grade !== 'all' && item.grade && item.grade !== filters.grade) return false
      if (filters.status && filters.status !== 'any' && item.status && item.status !== filters.status) return false

      return true
    })
  }, [data, filters])

  return (
    <>
      <DataTable
        columns={cols}
        data={filteredData}
        loading={loading}
        title="History Call"
        showSearch={false}
        renderViewOptions={(table) => <DataTableViewOptions table={table} />}
        toolbarLeft={<div className="text-lg font-semibold">History Call</div>}
        toolbarRight={toolbarRight}
      />

      <ExportDialog open={openExport} onOpenChange={(v) => setOpenExport(v)} data={data} onApply={({ from, to }) => {
        console.log('Export range', from, to)
      }} />

      <CallNoteDialog open={openNote} onOpenChange={(v) => setOpenNote(v)} note={selectedCall?.note} />
    </>
  )
}
