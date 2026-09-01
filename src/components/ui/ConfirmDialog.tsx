import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
  children?: ReactNode;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  destructive = false,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <AlertDialog.Title className="text-lg font-semibold text-slate-900">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-slate-500">{description}</AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {cancelText}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${destructive ? "bg-error hover:bg-error/90" : "bg-primary-container hover:bg-primary"}`}
            >
              {confirmText}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}