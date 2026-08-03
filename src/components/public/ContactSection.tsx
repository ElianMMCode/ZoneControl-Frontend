import { Icon } from "@/components/ui/Icon";
import type { ContactResponse } from "@/types";

export function ContactSection({ contact }: { contact: ContactResponse }) {
  const phone = contact.contact.phone;
  const email = contact.contact.email;
  const social = contact.contact.socialMedia;

  return (
    <section
      id="contacto"
      className="border-b border-outline-variant/40 bg-public-surface"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <header className="mb-8 text-center">
          <h2 className="text-heading-lg text-public-on-surface">Contacto</h2>
          <p className="mt-2 text-body-md text-public-on-surface-variant">
            ¿Tienes preguntas? Estamos para ayudarte.
          </p>
        </header>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          {phone ? (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-public-primary-container/30 text-public-primary">
                <Icon name="call" size="md" />
              </div>
              <h3 className="mt-3 label-caps text-public-on-surface">Teléfono</h3>
              <p className="mt-1 text-body-sm text-public-on-surface-variant">{phone}</p>
            </div>
          ) : null}
          {email ? (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-public-primary-container/30 text-public-primary">
                <Icon name="mail" size="md" />
              </div>
              <h3 className="mt-3 label-caps text-public-on-surface">Correo</h3>
              <p className="mt-1 break-all text-body-sm text-public-on-surface-variant">{email}</p>
            </div>
          ) : null}
          {social ? (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-public-primary-container/30 text-public-primary">
                <Icon name="share" size="md" />
              </div>
              <h3 className="mt-3 label-caps text-public-on-surface">Redes</h3>
              <p className="mt-1 break-all text-body-sm text-public-on-surface-variant">{social}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
