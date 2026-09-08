import { Loader2 } from "lucide-react";
import Card, { CardBody } from "@/components/ui/Card";

interface PortalLoadingStateProps {
  message?: string;
}

export default function PortalLoadingState({
  message = "Memuat...",
}: PortalLoadingStateProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <p className="text-sm text-slate-500">{message}</p>
      </CardBody>
    </Card>
  );
}
