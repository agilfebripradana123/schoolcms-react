import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  Wallet,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  FileText,
  Settings,
} from "lucide-react";
import type { NavigationGroup } from "../../types/navigation";

export const navigation: NavigationGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Academic",
    items: [
      {
        label: "Academic",
        path: "/academic",
        icon: GraduationCap,
        children: [
          { label: "Academic Year", path: "/academic/years" },
          { label: "Classes", path: "/academic/classes" },
          { label: "Subjects", path: "/academic/subjects" },
          { label: "Class Subjects", path: "/academic/class-subjects" },
          { label: "Attendance", path: "/academic/attendance" },
          { label: "Grades", path: "/academic/grades" },
        ],
      },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Teachers", path: "/teachers", icon: Users },
      { label: "Students", path: "/students", icon: GraduationCap },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Facilities",
        path: "/facilities",
        icon: Building2,
        children: [
          { label: "Rooms", path: "/facilities/rooms" },
          { label: "Assets", path: "/facilities/assets" },
          { label: "Maintenance", path: "/facilities/maintenance" },
          { label: "Inventory", path: "/facilities/inventory" },
        ],
      },
      { label: "Finance", path: "/finance", icon: Wallet },
      { label: "Communication", path: "/communication", icon: MessageSquare },
      { label: "PPDB", path: "/ppdb", icon: UserPlus },
      { label: "Examination", path: "/examination", icon: ClipboardCheck },
      { label: "Administration", path: "/administration", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "System",
        path: "/system",
        icon: Settings,
        children: [
          { label: "Users", path: "/system/users" },
          { label: "Roles", path: "/system/roles" },
          { label: "Settings", path: "/system/settings" },
        ],
      },
    ],
  },
];
