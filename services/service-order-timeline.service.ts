import {
  createServiceOrderTimeline,
  findServiceOrderTimeline,
} from "@/repositories/service-order-timeline.repository";

export async function listServiceOrderTimeline(
  serviceOrderId: string
) {
  return findServiceOrderTimeline(serviceOrderId);
}

export async function registerServiceOrderEvent(data: {
  serviceOrderId: string;
  type: string;
  title: string;
  description?: string | null;
}) {
  return createServiceOrderTimeline(data);
}