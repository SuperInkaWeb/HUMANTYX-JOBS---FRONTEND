export default function Footer() {
  return (
    <footer className="border-top mt-5">
      <div className="container py-4 small text-muted d-flex justify-content-between flex-wrap gap-2">
        <span>© {new Date().getFullYear()} Humantyx Jobs</span>
        <span>Portal de empleos</span>
      </div>
    </footer>
  );
}
