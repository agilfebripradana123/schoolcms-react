export function LoginPreloader() {
  return (
    <div
      role="status"
      aria-label="Memuat"
      aria-busy="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-container" />
    </div>
  );
}
