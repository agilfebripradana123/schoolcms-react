import { RouterProvider } from "react-router-dom";
import router from "@/app/router";
import { AppearanceProvider } from "@/features/system/appearance/AppearanceContext";

export default function App() {
  return (
    <AppearanceProvider>
      <RouterProvider router={router} />
    </AppearanceProvider>
  );
}