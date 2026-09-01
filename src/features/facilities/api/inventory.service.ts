import { api } from "@/lib/api";
import { FACILITIES } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  AdjustmentPayload,
  CreateInventoryPayload,
  FacilitiesListParams,
  FacilitiesPaginatedResponse,
  Inventory,
  StockInOutPayload,
  StockMovement,
  UpdateInventoryPayload,
} from "./types";

export const inventoryService = {
  async list(
    params?: FacilitiesListParams,
  ): Promise<FacilitiesPaginatedResponse<Inventory[]>> {
    return api.get<FacilitiesPaginatedResponse<Inventory[]>>(
      FACILITIES.INVENTORY,
      params,
    );
  },

  async get(id: number | string): Promise<ApiEnvelope<Inventory>> {
    return api.get<ApiEnvelope<Inventory>>(`${FACILITIES.INVENTORY}/${id}`);
  },

  async create(payload: CreateInventoryPayload): Promise<ApiEnvelope<Inventory>> {
    return api.post<ApiEnvelope<Inventory>>(FACILITIES.INVENTORY, payload);
  },

  async update(
    id: number | string,
    payload: UpdateInventoryPayload,
  ): Promise<ApiEnvelope<Inventory>> {
    return api.put<ApiEnvelope<Inventory>>(`${FACILITIES.INVENTORY}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${FACILITIES.INVENTORY}/${id}`);
  },

  async movements(id: number | string): Promise<ApiEnvelope<StockMovement[]>> {
    return api.get<ApiEnvelope<StockMovement[]>>(
      FACILITIES.INVENTORY_MOVEMENTS.replace("{id}", String(id)),
    );
  },

  async stockIn(id: number | string, payload: StockInOutPayload): Promise<ApiEnvelope<StockMovement>> {
    return api.post<ApiEnvelope<StockMovement>>(
      FACILITIES.INVENTORY_STOCK_IN.replace("{id}", String(id)),
      payload,
    );
  },

  async stockOut(id: number | string, payload: StockInOutPayload): Promise<ApiEnvelope<StockMovement>> {
    return api.post<ApiEnvelope<StockMovement>>(
      FACILITIES.INVENTORY_STOCK_OUT.replace("{id}", String(id)),
      payload,
    );
  },

  async adjustment(id: number | string, payload: AdjustmentPayload): Promise<ApiEnvelope<StockMovement>> {
    return api.post<ApiEnvelope<StockMovement>>(
      FACILITIES.INVENTORY_ADJUSTMENT.replace("{id}", String(id)),
      payload,
    );
  },
};
