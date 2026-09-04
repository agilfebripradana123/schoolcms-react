import type { ReactNode } from "react";
import Card, { CardBody } from "@/components/ui/Card";

interface PortalFilterBarProps {
  children: ReactNode;
  className?: string;
}

export default function PortalFilterBar({
  children,
  className = "",
}: PortalFilterBarProps) {
  return (
    <Card className={className}>
      <CardBody className="flex flex-wrap items-center gap-3">
        {children}
      </CardBody>
    </Card>
  );
}
