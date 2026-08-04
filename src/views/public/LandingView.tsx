import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { CatalogSection } from "@/components/public/CatalogSection";
import { LocationsSection } from "@/components/public/LocationsSection";
import { ContactSection } from "@/components/public/ContactSection";
import { BrochureCTA } from "@/components/public/BrochureCTA";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { usePublicData } from "@/hooks/usePublicData";

export function LandingView() {
  const data = usePublicData();
  const { info } = data.institutional ?? {};

  return (
    <div className="min-h-screen bg-public-surface text-public-on-surface">
      <PublicNavbar />

      {data.error ? (
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <ErrorState message={data.error} onRetry={data.refresh} />
        </div>
      ) : (
        <>
          <HeroSection
            companyName={info?.companyName ?? "Laboratorio XYZ"}
            description={info?.description}
          />
          <AboutSection
            mission={info?.mission}
            vision={info?.vision}
            description={info?.description}
          />
          <CatalogSection products={data.catalogo} />
          <LocationsSection offices={data.sedes} />
          <ContactSection contact={data.contact ?? { contact: {} }} />
          <BrochureCTA status={data.brochure} />
        </>
      )}

      {data.loading ? (
        <div className="mx-auto flex max-w-[1280px] gap-2 px-6 pb-6">
          <Skeleton className="h-4 w-32" />
        </div>
      ) : null}

      <PublicFooter />
    </div>
  );
}
