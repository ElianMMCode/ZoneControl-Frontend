import { PageHeader } from "@/components/common/PageHeader";
import { PartnerPeriodicSection } from "@/components/common/PartnerPeriodicSection";

export function PartnerExportView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Archivo para el Socio Internacional"
        subtitle="Generación y envío del archivo periódico de actividad de accesos"
      />
      <PartnerPeriodicSection />
    </div>
  );
}
