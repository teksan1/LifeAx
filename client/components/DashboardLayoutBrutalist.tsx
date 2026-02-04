import React from "react";
import { Sidebar } from "./ui/sidebar";
import { Topbar } from "./ui/topbar";

type Props = { children?: React.ReactNode };

export const DashboardLayoutBrutalist: React.FC<Props> = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <main style={{ flex: 1, padding: '1rem' }}>{children}</main>
    </div>
  </div>
);
