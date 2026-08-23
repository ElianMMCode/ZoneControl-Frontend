import type { CatalogResponse } from "@/types";
import { Icon } from "@/components/ui/Icon";

export function CatalogSection({ products }: { products: CatalogResponse[] }) {
  if (products.length === 0) {
    return (
      <section
        id="catalogo"
        className="border-b border-outline-variant/40 bg-public-surface"
      >
        <div className="mx-auto max-w-[1280px] px-6 py-16 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Catálogo</h2>
          <p className="mt-3 text-body-sm text-public-on-surface-variant">
            Aún no hay productos publicados en el catálogo.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section
      id="catalogo"
      className="border-b border-outline-variant/40 bg-public-surface"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <header className="mb-8 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Catálogo de Productos</h2>
          <p className="mt-2 text-body-md text-public-on-surface-variant">
            Conoce nuestros medicamentos fabricados bajo estándares GMP.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="flex flex-col gap-3 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm"
            >
              <div className="aspect-[4/3] w-full bg-surface-container">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={`Imagen de ${p.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(ev) => {
                      (ev.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-on-surface-variant">
                    <Icon name="medication" size="lg" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 p-6">
                <h3 className="text-heading-md text-public-on-surface">{p.name}</h3>
                {p.description ? (
                  <p className="text-body-sm text-public-on-surface-variant">{p.description}</p>
                ) : null}
                <dl className="mt-auto grid gap-1 text-body-sm">
                  {p.activeIngredient ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-on-surface-variant">Principio activo</dt>
                      <dd className="text-public-on-surface">{p.activeIngredient}</dd>
                    </div>
                  ) : null}
                  {p.presentation ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-on-surface-variant">Presentación</dt>
                      <dd className="text-public-on-surface">{p.presentation}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
