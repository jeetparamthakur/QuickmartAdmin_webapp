"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  format?: "csv" | "excel" | "pdf";
}

export function ExportButton({ data, filename, format = "csv" }: ExportButtonProps) {
  const handleExport = async () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    if (format === "csv") {
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(blob, `${filename}.csv`);
    } else if (format === "excel") {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(filename, 14, 20);
      doc.setFontSize(10);
      const headers = Object.keys(data[0]);
      let y = 30;
      data.slice(0, 30).forEach((row, i) => {
        doc.text(`${i + 1}. ${headers.map((h) => `${h}: ${row[h]}`).join(" | ")}`, 14, y);
        y += 8;
        if (y > 280) return;
      });
      doc.save(`${filename}.pdf`);
    }
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export {format.toUpperCase()}
    </Button>
  );
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
