import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../../components/layout";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { NotFoundPage } from "../../features/dashboard/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
