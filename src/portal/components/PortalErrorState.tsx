import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PortalErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function PortalErrorState({
  message,
  onRetry,
}: PortalErrorStateProps) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-red-600">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Muat Ulang
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
