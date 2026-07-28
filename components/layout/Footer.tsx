export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} cordoba.online
      </div>
    </footer>
  );
}