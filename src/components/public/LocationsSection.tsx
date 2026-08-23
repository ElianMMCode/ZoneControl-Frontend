import type { OfficeResponse } from "@/types";
import { Icon } from "@/components/ui/Icon";

export function LocationsSection({ offices }: { offices: OfficeResponse[] }) {
  if (offices.length === 0) {
    return (
      <section
        id="sedes"
        className="border-b border-outline-variant/40 bg-surface-container-lowest"
      >
        <div className="mx-auto max-w-[1280px] px-6 py-16 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Sedes</h2>
          <p className="mt-3 text-body-sm text-public-on-surface-variant">
            Aún no hay sedes registradas.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section
      id="sedes"
      className="border-b border-outline-variant/40 bg-surface-container-lowest"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <header className="mb-8 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Nuestras Sedes</h2>
          <p className="mt-2 text-body-md text-public-on-surface-variant">
            Producción y atención en las principales ciudades del país.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((o) => (
            <article
              key={o.id}
              className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-public-surface shadow-sm"
            >
              <div className="aspect-[4/3] w-full bg-surface-container">
                {o.imageUrl ? (
                  <img
                    src={o.imageUrl}
                    alt={`Imagen de ${o.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(ev) => {
                      (ev.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-on-surface-variant">
                    <Icon name="apartment" size="lg" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-public-primary">
                  <Icon name="location_on" size="md" />
                  <h3 className="text-heading-md text-public-on-surface">{o.name}</h3>
                </div>
                {o.address ? (
                  <p className="mt-3 flex items-start gap-2 text-body-sm text-public-on-surface-variant">
                    <Icon name="place" size="sm" /> {o.address}
                  </p>
                ) : null}
                {o.openingHours ? (
                  <p className="mt-2 flex items-center gap-2 text-body-sm text-public-on-surface-variant">
                    <Icon name="schedule" size="sm" /> {o.openingHours}
                  </p>
                ) : null}
                {o.latitude != null && o.longitude != null ? (
                  <p className="mt-2 font-mono text-[11px] text-on-surface-variant">
                    {o.latitude.toFixed(4)}, {o.longitude.toFixed(4)}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
