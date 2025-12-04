import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useTopContacts from "@/hooks/useTopContacts";
import { CategoryBadge } from "@/components/ui/badges";

export default function ContactPriorityCard({
  data = null,
  className,
  onOpenCustomer,
  loading = false,
}) {
  // Bisa diganti dengan data nyata dari parent component, atau menggunakan hook untuk simulasi loading
  const { data: hookData, isLoading } = useTopContacts({ count: 5 });
  const list = Array.isArray(data) ? data.slice(0, 5) : hookData;
  const finalLoading = loading || isLoading;

  function openCustomerDetail(id) {
    if (typeof onOpenCustomer === "function") {
      onOpenCustomer(id);
      return;
    }

    // Placeholder navigation/dialog integration
    // Masih dummy
    console.log("Open customer detail for", id);
  }

  function getCategory(item) {
    // Prefer explicit category if provided
    if (item && item.category) return item.category;
    // Otherwise try to derive from numeric score if available
    const score = Number(item?.score);
    if (!Number.isFinite(score)) return null;
    if (score >= 80) return "Grade A";
    if (score >= 50) return "Grade B";
    return "Grade C";
  }

  // CategoryBadge component is used for rendering grade badges

  return (
    <Card className={cn("p-3", className)}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col">
            <div className="text-sm font-semibold">Kontak Prioritas</div>
            <div className="text-xs text-muted-foreground">
              Nasabah prioritas anda hari ini
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                /* navigate to full customers page */
              }}
            >
              Lihat Semua
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {finalLoading
            ? // Skeleton for loading state (5 rows)
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))
            : (list || []).map((item) => {
                const category = getCategory(item);
                return (
                  <div
                    key={item.id}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{item.name}</div>
                        {category && (
                          <CategoryBadge
                            category={category.replace(/^Grade\s*/i, "")}
                          />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Terakhir dihubungi: {item.lastContact}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => openCustomerDetail(item.id)}
                      >
                        Detail
                      </Button>
                    </div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
