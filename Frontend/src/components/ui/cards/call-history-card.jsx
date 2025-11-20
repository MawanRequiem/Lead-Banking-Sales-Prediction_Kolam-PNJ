import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

// entries: [{ id, nama (nasabah), time, agent, duration, result, note }]
export default function CallHistoryCard({ entries = [], onExport }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Riwayat Telepon</CardTitle>
        </div>
        <CardAction>
          {onExport ? <Button onClick={onExport}>Selengkapnya</Button> : null}
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
          {entries.length ? (
            entries.map((e) => (
              <details key={e.id} className="group border rounded-lg bg-background-secondary overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{e.nama || e.agent || '—'}</div>
                    <div className="text-xs text-muted-foreground">{e.time}</div>
                  </div>

                  <div className="ml-4 flex items-center gap-3">
                    <div className="text-sm text-muted-foreground hidden sm:block">{e.duration || ''}</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-card text-foreground border border-border">{e.result || '-'}</div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </div>
                </summary>

                <div className="px-4 pb-3 pt-1 border-t border-border bg-card/50">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Nama Nasabah</div>
                      <div className="text-foreground font-medium">{e.nama || '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Tanggal Telepon</div>
                      <div className="text-foreground">{e.time}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Hasil Telepon</div>
                      <div className="text-foreground">{e.result || '-'}</div>
                    </div>
                    {e.note ? (
                      <div>
                        <div className="text-muted-foreground text-xs">Catatan</div>
                        <div className="text-foreground">{e.note}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </details>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Tidak ada riwayat telepon.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
