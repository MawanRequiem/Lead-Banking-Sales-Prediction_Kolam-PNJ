import React from "react";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }) {
  if (!status) return null;

  const className = (() => {
    switch (status) {
      case "Dalam Panggilan":
        return "bg-gray-100 text-gray-800";
      case "Tersedia":
        return "bg-green-100 text-green-800";
      case "Assign":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  })();

  return <Badge className={className}>{status}</Badge>;
}

export function CategoryBadge({ category }) {
  if (category === null) return null;

  const normalizedCategory = (() => {
    const num = Number(category);

    if (!Number.isNaN(num)) {
      if (num >= 0.75) return "A";
      if (num >= 0.5) return "B";
      return "C";
    }

    // If it's not a number, assume it's already "A" | "B" | "C"
    const str = String(category).toUpperCase();
    if (["A", "B", "C"].includes(str)) return str;

    return null;
  })();

  if (!normalizedCategory) return null;

  const className =
    {
      A: "bg-chart-1 text-white",
      B: "bg-chart-2 text-white",
      C: "bg-chart-3 text-white",
    }[normalizedCategory] || "bg-muted text-muted-foreground";

  return <Badge className={className}>Grade {normalizedCategory}</Badge>;
}

export function DepositStatusBadge({ status }) {
  if (!status) return null;

  const className = (() => {
    switch (String(status).toLowerCase()) {
      case "active":
        return "bg-green-600 text-white";
      case "inactive":
        return "bg-red-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  })();

  return <Badge className={className}>{status}</Badge>;
}

export function DepositTypeBadge({ type }) {
  if (!type) return null;

  // Normalize and map common types to placeholder classes.
  // You can tweak the classNames (colors) later to match your design system.
  const t = String(type).trim().toUpperCase();

  const className = (() => {
    switch (t) {
      case "A":
        return "bg-chart-1 text-white";
      case "B":
        return "bg-chart-2 text-white";
      case "C":
        return "bg-chart-3 text-white";
      case "D":
        return "bg-chart-4 text-white";
      default:
        return "bg-violet-600 text-white";
    }
  })();

  // Display as Indonesian label to match surrounding UI
  const label = /^A|B|C|D$/.test(t) ? `Tipe ${t}` : String(type);

  return <Badge className={className}>{label}</Badge>;
}

export function MarriageBadge({ value }) {
  if (!value) return null;

  const v = String(value).trim();

  const className = (() => {
    switch (v) {
      case "Menikah":
        return "bg-green-100 text-green-700";
      case "Lajang":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  })();

  return (
    <Badge
      className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {v}
    </Badge>
  );
}

export function CallResultBadge({ result }) {
  if (!result) return null;

  const r = String(result).trim();

  const className = (() => {
    switch (r.toLowerCase()) {
      case "terkoneksi":
        return "bg-green-100 text-green-700";
      case "voicemail":
        return "bg-yellow-100 text-yellow-700";
      case "tidak tersambung":
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  })();

  return (
    <Badge
      className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {r}
    </Badge>
  );
}

export default {
  StatusBadge,
  CategoryBadge,
  DepositStatusBadge,
  DepositTypeBadge,
  MarriageBadge,
  CallResultBadge,
};
