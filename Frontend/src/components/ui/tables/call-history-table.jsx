import React, { useState, useMemo } from 'react'
import DataTable from '@/components/ui/tables/data-table'
import DataTableViewOptions from './data-table-view-options'
import { Button } from '@/components/ui/button'
import ExportDialog from '@/components/ui/dialogs/export-dialog'
import useTable from '@/hooks/useTable'
import FilterDropdown from '../dropdown/filter-dropdown'

const historyColumns = [
  { accessorKey: 'time', header: 'Waktu' },
  { accessorKey: 'agent', header: 'Agen' },
  { accessorKey: 'duration', header: 'Durasi' },
  { accessorKey: 'result', header: 'Hasil' },
]

const historyMock = [
  { id: 'h1', time: '2025-11-18 10:00', agent: 'Ari', duration: '00:05:23', result: 'Terkoneksi' },
  { id: 'h2', time: '2025-11-18 11:30', agent: 'Budi', duration: '00:02:10', result: 'Voicemail' },
]

export default function CallHistoryTable() {
  const [openExport, setOpenExport] = useState(false)
  const [filters, setFilters] = useState({ from: null, to: null, grade: 'all', status: 'any', keyword: '' })

  const { data, loading } = useTable({ initial: historyMock })

  const cols = useMemo(() => historyColumns, [])

  function applyFilter(payload) {
    // jika berganting ke server-side filtering, ganti setFilters dengan 
    // fetch ke backend. Contoh:
    // const qs = new URLSearchParams(payload).toString()
    // fetch(`/api/calls?${qs}`)
    //   .then(r => r.json())
    //   .then(json => setData(json.rows))
    //   .catch(err => console.error(err))
    //
    // Backend/ORM notes:
    // - Backend harus memvalidasi/memparsing tanggal dan kata kunci dengan aman.
    // - Gunakan query parameterized atau query builder ORM dan hindari konkatenasi string.
    // - Prefer mengembalikan hasil yang dipaginasi dan total count.
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
        const nama = String(item.nama || '').toLowerCase()
        if (!agent.includes(kw) && !nama.includes(kw)) return false
      }

      // mengatur filter rentang tanggal (mengasumsikan item.time dapat diurai)
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

      // mengatur filter grade/status jika ada pada item
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
        // dummy logic export
        console.log('Export range', from, to)
      }} />
    </>
  )
}
