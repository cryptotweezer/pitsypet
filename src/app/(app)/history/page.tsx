import { redirect } from "next/navigation";

// History moved into the dashboard shell; keep the old URL working.
export default function HistoryPage() {
  redirect("/dashboard/history");
}
