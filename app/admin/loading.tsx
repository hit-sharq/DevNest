export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading...</p>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
