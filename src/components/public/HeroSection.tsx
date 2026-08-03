import { Icon } from "@/components/ui/Icon";

export function HeroSection({
  companyName,
  description,
  productionAreas,
}: {
  companyName: string;
  description?: string;
  productionAreas?: string[];
}) {
  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden border-b border-outline-variant/40 bg-public-surface"
    >
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-public-primary-container/30 px-3 py-1 text-body-sm font-semibold text-public-primary">
            <Icon name="science" size="sm" /> Innovación médica
          </span>
          <h1 className="mt-4 text-heading-xl font-bold text-public-on-surface">
            {companyName}
          </h1>
          {description ? (
            <p className="mt-4 text-body-lg text-public-on-surface-variant">{description}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#catalogo"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-public-primary px-6 text-body-md font-semibold text-public-on-primary hover:bg-public-primary-container"
            >
              <Icon name="inventory_2" size="sm" /> Ver Catálogo
            </a>
            <a
              href="#quienes-somos"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-public-primary px-6 text-body-md font-semibold text-public-primary hover:bg-public-primary-container/10"
            >
              Saber más
            </a>
          </div>
        </div>
        <aside className="rounded-lg border border-public-primary/30 bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center gap-2 text-body-sm font-semibold text-public-primary">
            <Icon name="verified" size="sm" /> Calidad Certificada
          </div>
          <p className="mt-2 text-body-sm text-public-on-surface-variant">
            Estándares GMP y Buenas Prácticas de Manufactura en todas
            nuestras líneas de producción.
          </p>
          {productionAreas && productionAreas.length > 0 ? (
            <ul className="mt-4 space-y-1 text-body-sm text-public-on-surface">
              {productionAreas.map((area) => (
                <li key={area} className="flex items-center gap-2">
                  <Icon name="check" size="sm" className="text-secondary" /> {area}
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
