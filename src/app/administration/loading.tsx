export default function AdministrationLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-gray-400">Chargement de l&apos;administration…</p>
        </div>
      </div>
    </div>
  );
}
