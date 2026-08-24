import { useRef } from "react";
import type { CatalogResponse } from "@/types";
import { Icon } from "@/components/ui/Icon";

function ProductCard({ product }: { product: CatalogResponse }) {
  return (
    <article className="flex w-[280px] shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="h-56 w-full shrink-0 bg-surface-container">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`Imagen de ${product.name}`}
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
      <div className="flex flex-col gap-3 p-5">
        <h4 className="text-heading-md text-public-on-surface">{product.name}</h4>
        {product.description ? (
          <p className="line-clamp-2 text-body-sm text-public-on-surface-variant">{product.description}</p>
        ) : null}
        <dl className="mt-auto grid gap-1 text-body-sm">
          {product.activeIngredient ? (
            <div className="flex justify-between gap-2">
              <dt className="text-on-surface-variant">Principio activo</dt>
              <dd className="text-right text-public-on-surface">{product.activeIngredient}</dd>
            </div>
          ) : null}
          {product.presentation ? (
            <div className="flex justify-between gap-2">
              <dt className="text-on-surface-variant">Presentación</dt>
              <dd className="text-right text-public-on-surface">{product.presentation}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

function ProductCarousel({ products }: { products: CatalogResponse[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 300), behavior: "smooth" });
  };

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <button
        type="button"
        aria-label="Productos anteriores"
        onClick={() => scrollByCards(-1)}
        className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface shadow-md transition-colors hover:bg-surface-container md:grid"
      >
        <Icon name="chevron_left" size="sm" />
      </button>
      <button
        type="button"
        aria-label="Productos siguientes"
        onClick={() => scrollByCards(1)}
        className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface shadow-md transition-colors hover:bg-surface-container md:grid"
      >
        <Icon name="chevron_right" size="sm" />
      </button>
    </div>
  );
}

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

  const groups = new Map<string, CatalogResponse[]>();
  for (const p of products) {
    const key = p.categoryName ?? "Otros productos";
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }
  const sections = [...groups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es"),
  );

  return (
    <section
      id="catalogo"
      className="border-b border-outline-variant/40 bg-public-surface"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <header className="mb-10 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Catálogo de Productos</h2>
          <p className="mt-2 text-body-md text-public-on-surface-variant">
            Conoce nuestros medicamentos fabricados bajo estándares GMP.
          </p>
        </header>
        <div className="space-y-14">
          {sections.map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-public-primary-container/30 text-public-primary">
                  <Icon name="category" size="sm" />
                </span>
                <h3 className="text-heading-md text-public-on-surface">{categoryName}</h3>
                <span className="text-body-sm text-on-surface-variant">
                  ({items.length})
                </span>
              </div>
              <ProductCarousel products={items} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
