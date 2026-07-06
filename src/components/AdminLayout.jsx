import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("hx_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("hx_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className={`hx-dashboard ${collapsed ? "hx-dashboard--collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <main className="hx-dashboard__main">
        <AdminHeader />

        <div className="hx-dashboard__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}