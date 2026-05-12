import { Outlet } from "react-router-dom";
import { Header } from "../components/index.js";

export default function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

