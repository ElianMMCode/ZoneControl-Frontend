import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Props {
  page: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function Pagination({ page, totalPages, totalElements, pageSize = 10, onPageChange, itemLabel = "resultados" }: Props) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(totalElements ?? (page + 1) * pageSize, (page + 1) * pageSize);
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-body-sm text-on-surface-variant">
        Mostrando {from}–{to} de {totalElements ?? "—"} {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">
          <Icon name="chevron_left" size="sm" /> Anterior
        </Button>
        <span className="px-2 text-body-sm text-on-surface">Página {page + 1} de {totalPages || 1}</span>
        <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Página siguiente">
          Siguiente <Icon name="chevron_right" size="sm" />
        </Button>
      </div>
    </nav>
  );
}
