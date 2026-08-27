import { createBrowserRouter } from "react-router-dom";

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <h1 className="text-2xl font-bold text-white">Login</h1>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-lg text-slate-600">Halaman tidak ditemukan</p>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
