import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Card, { CardHeader } from "@/components/ui/Card";

interface TeacherSectionCardProps {
  title: string;
  description?: string;
  to?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Kartu section yang dipakai di seluruh Dashboard Guru.
 * Memiliki header (judul + deskripsi) dan aksi "Lihat semua"
 * bila diberikan `to` (path navigasi existing).
 */
export default function TeacherSectionCard({
  title,
  description,
  to,
  linkLabel = "Lihat semua",
  children,
  className = "",
}: TeacherSectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader
        title={title}
        description={description}
        actions={
          to ? (
            <Link
              to={to}
              className="text-sm font-semibold text-primary hover:text-primary-container"
            >
              {linkLabel}
            </Link>
          ) : undefined
        }
      />
      {children}
    </Card>
  );
}
