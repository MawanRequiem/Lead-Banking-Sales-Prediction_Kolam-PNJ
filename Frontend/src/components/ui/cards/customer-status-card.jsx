import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PhoneOutgoing, PhoneMissed, Coins } from "lucide-react";
import { useLang } from "@/hooks/useLang";

function StatColumn({
  labelTop,
  value,
  labelBottom,
  Icon,
  isPlaceholder = false,
}) {
  return (
    <div className="flex-1 min-w-0 px-3 py-2 flex items-center">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground">{labelTop}</div>
        {isPlaceholder ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
        ) : (
          <div className="text-2xl font-semibold text-foreground leading-tight">
            {value}
          </div>
        )}
        {labelBottom ? (
          <div className="text-xs text-muted-foreground mt-1">
            {labelBottom}
          </div>
        ) : null}
      </div>
      <div className="ml-3 flex-shrink-0">
        {Icon ? (
          <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
        ) : null}
      </div>
    </div>
  );
}

export default function CustomerStatusCard({
  // either provide `data` (preferred) or `entries` as fallback
  data = null,
  entries = [],
  // legacy single-value overrides (optional)
  successfulCount,
  missedCount,
  totalCount,
  loading = false,
  error = null,
  className,
}) {
  const { t } = useLang();
  // bisa menggunakan hook dan uncomment the code below (example only):
  //
  // import { useCustomerStatus } from '@/hooks/useCustomerStatus'
  // const { data, isLoading, error } = useCustomerStatus(customerId)
  //
  // atau dengan TanStack Query langsung, contoh:
  // const { data, isLoading, error } = useQuery(['customerStatus', customerId], () => fetchStatus(customerId))

  // Menghitung total success, missed, dan total melalui input yang diberikan berupa prioritas:
  // 1) `data` prop (server-aggregated)
  // 2) explicit counts passed via props
  // 3) compute from `entries` array
  const { success, missed, total } = useMemo(() => {
    if (data && typeof data === "object") {
      return {
        success: Number(data.success || 0),
        missed: Number(data.missed || 0),
        total: Number(data.total || 0),
      };
    }

    if (
      typeof successfulCount === "number" ||
      typeof missedCount === "number" ||
      typeof totalCount === "number"
    ) {
      return {
        success: Number(successfulCount || 0),
        missed: Number(missedCount || 0),
        total: Number(totalCount || 0),
      };
    }

    // Fallback: compute from raw `entries` (client-side)
    const keywordsSuccess = [
      "terkoneksi",
      "connected",
      "success",
      "sukses",
      "answered",
    ];
    const keywordsMissed = [
      "voicemail",
      "missed",
      "no answer",
      "tidak terangkat",
      "tidak jawab",
    ];

    const computed = entries.reduce(
      (acc, e) => {
        const r = String(e?.result || "").toLowerCase();
        acc.total += 1;
        if (keywordsSuccess.some((k) => r.includes(k))) acc.success += 1;
        if (keywordsMissed.some((k) => r.includes(k))) acc.missed += 1;
        return acc;
      },
      { success: 0, missed: 0, total: 0 }
    );

    return computed;
  }, [data, entries, successfulCount, missedCount, totalCount]);

  // Menghitung persentase keberhasilan untuk ditampilkan
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  // Simple loading/error states.
  if (loading) {
    return (
      <Card className={cn("p-3", className)}>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-border">
            <StatColumn
              labelTop={t(
                "card.customerStatus.connectedTop",
                "Berhasil dihubungi"
              )}
              isPlaceholder
            />
            <StatColumn
              labelTop={t(
                "card.customerStatus.ringingTop",
                "Telepon berdering"
              )}
              isPlaceholder
            />
            <StatColumn
              labelTop={t("card.customerStatus.percentageTop", "Persentase")}
              isPlaceholder
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-3", className)}>
        <CardContent>
          <div className="text-sm text-destructive">
            {t("card.customerStatus.loadError", "Gagal memuat data status")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("p-3", className)}>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-border">
          <StatColumn
            labelTop={t(
              "card.customerStatus.connectedTop",
              "Berhasil dihubungi"
            )}
            value={success}
            labelBottom={t("card.customerStatus.customers", "nasabah")}
            Icon={PhoneOutgoing}
          />
          <StatColumn
            labelTop={t("card.customerStatus.ringingTop", "Telepon berdering")}
            value={missed}
            labelBottom={t("card.customerStatus.customers", "nasabah")}
            Icon={PhoneMissed}
          />
          <StatColumn
            labelTop={t("card.customerStatus.percentageTop", "Persentase")}
            value={`${successRate}%`}
            labelBottom={t("card.customerStatus.successRate", "Keberhasilan")}
            Icon={Coins}
          />
        </div>
      </CardContent>
    </Card>
  );
}
