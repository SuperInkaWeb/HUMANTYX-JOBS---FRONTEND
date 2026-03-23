import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout() {
  return (
    <div className="hx-dashboard">
      <Sidebar />
      <div className="hx-dashboard__content">
        <Outlet />
      </div>
    </div>
  );
}