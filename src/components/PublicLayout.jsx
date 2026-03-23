import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="layout">
      <Navbar />

      <main className="layout-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}