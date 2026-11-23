export default function Loading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-header/20 border-t-header" />
        <p className="text-sm text-secondary">Loading...</p>
      </div>
    </main>
  )
}
