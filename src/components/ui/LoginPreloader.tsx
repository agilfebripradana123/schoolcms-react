export function LoginPreloader() {
  return (
    <div
      role="status"
      aria-label="Memuat"
      aria-busy="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-outline-variant border-t-primary-container" />
    </div>
  );
}
