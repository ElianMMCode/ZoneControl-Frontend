export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-8">
      <span className="material-symbols-outlined text-primary" aria-hidden="true">
        lock_open
      </span>
      <h1 className="font-label-caps text-primary">Laboratorio XYZ</h1>
      <p className="font-body-sm text-on-surface-variant">
        Sistema de Control de Acceso — frontend en construcción
      </p>
      <button className="rounded-lg bg-primary px-4 py-2 font-body-sm font-semibold text-on-primary">
        Botón de prueba (Tailwind OK)
      </button>
    </main>
  );
}
