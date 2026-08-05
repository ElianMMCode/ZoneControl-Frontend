import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { AccessAlertDto, AccessHistoryResponse, AccessResult, AreaOccupancy, RealtimeEvent, ZoneSnapshot } from "@/types";

export type ValidatedEvent = Extract<RealtimeEvent, { type: "access.validated" }>;

const RESULT_MESSAGE: Record<AccessResult, string> = {
  AUTHORIZED: "INGRESO AUTORIZADO",
  DENIED: "INGRESO DENEGADO",
  UNREGISTERED: "NO REGISTRADO",
  SUSPENDED: "ACCESO SUSPENDIDO",
  EXIT: "SALIDA REGISTRADA",
};

const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const iso = (d: Date) => d.toISOString().slice(0, 10);

function toValidatedEvent(h: AccessHistoryResponse): ValidatedEvent {
  return {
    type: "access.validated",
    employeeCode: h.employeeCode ?? "N/A",
    employeeName: h.employeeName ?? null,
    area: h.productionAreaName,
    result: h.result,
    message: RESULT_MESSAGE[h.result],
    timestamp: h.timestamp,
  };
}

/**
 * Suscripción SSE al stream de zonas en vivo (§9.3 item 2.3).
 * EventSource no permite header Authorization, por eso el token viaja como
 * query param (el backend solo lo acepta en /api/access/stream).
 * Se reconecta automáticamente (EventSource nativo) y refresca el snapshot.
 * Las "validaciones recientes" arrancan con el historial persistido
 * (GET /api/historial) y luego se alimentan en vivo con SSE, para que la
 * evidencia de cada intento quede visible aunque se recargue la vista.
 */
export function useZoneStream() {
  const token = useAuthStore((s) => s.token);
  const esRef = useRef<EventSource | null>(null);
  const [connected, setConnected] = useState(false);
  const [zones, setZones] = useState<ZoneSnapshot[]>([]);
  const [occupancy, setOccupancy] = useState<AreaOccupancy[]>([]);
  const [alerts, setAlerts] = useState<AccessAlertDto[]>([]);
  const [validations, setValidations] = useState<ValidatedEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`/api/access/stream?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    const onEvent = (name: string) => (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as RealtimeEvent;
        switch (name) {
          case "snapshot": {
            const snap = data as { type: "snapshot"; zones: ZoneSnapshot[]; occupancy: AreaOccupancy[] };
            setZones(snap.zones ?? []);
            setOccupancy(snap.occupancy ?? []);
            break;
          }
          case "occupancy.updated": {
            // El snapshot de ocupación solo llega al conectar; la vista refresca
            // la ocupación vía GET /api/access/occupancy cuando llega este evento.
            refetchOccupancy();
            break;
          }
          case "access.validated": {
            const ev = data as ValidatedEvent;
            setValidations((v) => [ev, ...v].slice(0, 30));
            break;
          }
          case "zone.updated": {
            const ev = data as { type: "zone.updated"; area: string; emergencyClosed: boolean };
            setZones((zs) => zs.map((z) => (z.name === ev.area ? { ...z, emergencyClosed: ev.emergencyClosed } : z)));
            break;
          }
          case "alert.created": {
            const ev = data as { type: "alert.created"; alert: AccessAlertDto };
            setAlerts((a) => [ev.alert, ...a].slice(0, 50));
            break;
          }
        }
      } catch {
        // ignore malformed event
      }
    };

    const refetchOccupancy = async () => {
      try {
        const res = await fetch("/api/access/occupancy", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = (await res.json()) as { areas: AreaOccupancy[] };
          setOccupancy(json.areas ?? []);
        }
      } catch {
        // ignore
      }
    };

    const loadRecentValidations = async () => {
      try {
        const res = await fetch(
          `/api/historial?fechaInicio=${iso(thirtyDaysAgo)}&fechaFin=${iso(today)}&page=0&size=20&sort=timestamp,desc`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) return;
        const json = (await res.json()) as { content: AccessHistoryResponse[] };
        const persisted = json.content.map(toValidatedEvent);
        setValidations((v) => [...v, ...persisted].slice(0, 30));
      } catch {
        // ignore: la lista queda vacía hasta el primer evento en vivo
      }
    };

    es.addEventListener("snapshot", onEvent("snapshot"));
    es.addEventListener("access.validated", onEvent("access.validated"));
    es.addEventListener("occupancy.updated", onEvent("occupancy.updated"));
    es.addEventListener("zone.updated", onEvent("zone.updated"));
    es.addEventListener("alert.created", onEvent("alert.created"));

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };
    es.onerror = () => {
      setConnected(false);
      setError("Reconectando al stream de zonas…");
    };

    loadRecentValidations();

    return () => {
      es.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const reconnect = () => {
    setError("Reconectando…");
  };

  return { connected, zones, occupancy, alerts, validations, error, reconnect };
}
