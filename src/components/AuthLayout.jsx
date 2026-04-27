import { Outlet, Link } from "react-router-dom";
import "./auth-layout.css";

export default function AuthLayout() {
  return (
    <div className="hx-auth-layout">

      <div className="hx-auth-layout__logo">
        <Link to="/">
          <img
            src="/logo-oficial.png"
            alt="Humantyx"
            className="hx-auth-logo"
            
          />
        </Link>
      </div>

      <div className="hx-auth-layout__content">
        <Outlet />
      </div>

    </div>
  );
}