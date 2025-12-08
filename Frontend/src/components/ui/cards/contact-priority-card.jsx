import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/components/ui/badges";
import { useLang } from "@/hooks/useLang";

export default function ContactPriorityCard({
  data,
  className,
  onOpenCustomer,
  loading = false,
}) {
  const navigate = useNavigate();
  const { t } = useLang();
  const list = Array.isArray(data) ? data.slice(0, 5) : [];
  const finalLoading = loading;

  function openCustomerDetail(id) {
    if (typeof onOpenCustomer === "function") {
      onOpenCustomer(id);
      return;
    }
  }

  function getCategory(item) {
    // Prefer explicit category if provided
    if (item && item.category) return item.category;
    // Otherwise try to derive from numeric score if available
    const score = Number(item?.skor);
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
            <div className="text-sm font-semibold">
              {t("card.contactPriority.title", "Kontak Prioritas")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t(
                "card.contactPriority.subtitle",
                "Nasabah prioritas anda hari ini"
              )}
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate("/assignments");
              }}
            >
              {t("card.contactPriority.seeAll", "Lihat Semua")}
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {finalLoading ? (
            // Skeleton for loading state (5 rows)
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-2">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : list && list.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {t(
                "card.contactPriority.empty",
                "Tidak ada kontak prioritas untuk ditampilkan hari ini."
              )}
            </div>
          ) : (
            // Daftar kontak ditampilkan
            (list || []).map((item, idx) => {
              const id = item?.id ?? item?.userId ?? item?.customerId ?? idx;
              const name = item?.name ?? item?.nama ?? item?.email ?? "-";
              const lastContact =
                item?.lastContact ?? item?.last_contact ?? "-";
              const category = getCategory(item);
              const badgeLabel =
                typeof category === "string"
                  ? category.replace(/^Grade\s*/i, "")
                  : null;

              return (
                <div
                  key={id}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{name}</div>
                      {badgeLabel && <CategoryBadge category={badgeLabel} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground text-right">
                      {t(
                        "card.contactPriority.lastContact",
                        "Terakhir dihubungi:"
                      )}{" "}
                      {lastContact}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
