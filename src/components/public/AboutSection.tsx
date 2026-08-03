import { Icon } from "@/components/ui/Icon";

export function AboutSection({
  mission,
  vision,
  description,
}: {
  mission?: string;
  vision?: string;
  description?: string;
}) {
  return (
    <section
      id="quienes-somos"
      className="border-b border-outline-variant/40 bg-surface-container-lowest"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <header className="mb-8 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Quiénes Somos</h2>
          <p className="mt-2 text-body-md text-public-on-surface-variant">
            Conoce nuestra misión, visión y propósito.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-lg border border-outline-variant bg-public-surface p-6">
            <div className="flex items-center gap-2 text-public-primary">
              <Icon name="flag" size="md" />
              <h3 className="text-heading-md text-public-on-surface">Misión</h3>
            </div>
            <p className="mt-3 text-body-sm text-public-on-surface-variant">
              {mission || "Información de misión no disponible."}
            </p>
          </article>
          <article className="rounded-lg border border-outline-variant bg-public-surface p-6">
            <div className="flex items-center gap-2 text-public-primary">
              <Icon name="visibility" size="md" />
              <h3 className="text-heading-md text-public-on-surface">Visión</h3>
            </div>
            <p className="mt-3 text-body-sm text-public-on-surface-variant">
              {vision || "Información de visión no disponible."}
            </p>
          </article>
          <article className="rounded-lg border border-outline-variant bg-public-surface p-6">
            <div className="flex items-center gap-2 text-public-primary">
              <Icon name="biotech" size="md" />
              <h3 className="text-heading-md text-public-on-surface">La Compañía</h3>
            </div>
            <p className="mt-3 text-body-sm text-public-on-surface-variant">
              {description || "Información de la compañía no disponible."}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
