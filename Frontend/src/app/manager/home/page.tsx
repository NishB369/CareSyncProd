import type { Metadata } from "next";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "Home | Dashboard",
  description: "See insights and stats about your clinic's performance",
};

export default function Page() {
  return <Dashboard />;
}
