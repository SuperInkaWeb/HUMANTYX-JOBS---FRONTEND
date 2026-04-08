import { useContext } from "react";
import { AuthCtx } from "../context/auth-context";

export function useAuth() {
  return useContext(AuthCtx);
}