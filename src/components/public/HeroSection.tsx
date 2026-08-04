import { Icon } from "@/components/ui/Icon";

export function HeroSection({
  companyName,
  description,
}: {
  companyName: string;
  description?: string;
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
            <p className="mt-4 text-body-lg text-public-on-surface-variant">
              {description}
            </p>
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
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
            <img
              src="artix-home-process.jpg"
              alt="Equipo de laboratorio farmacéutico de Laboratorio XYZ"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 flex items-center gap-4 rounded-xl border border-outline-variant bg-white p-6 shadow-xl">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-public-primary-container/30 text-public-primary">
              <Icon name="verified" size="lg" />
            </span>
            <div>
              <p className="text-heading-md font-semibold text-public-on-surface">
                Calidad Certificada
              </p>
              <p className="text-body-sm text-public-on-surface-variant">
                Estándares Internacionales GMP
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
