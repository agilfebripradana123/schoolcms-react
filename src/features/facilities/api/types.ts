import type { ListParams } from "@/types";

export interface Room {
  id: number;
  code?: string;
  name: string;
  type?: string;
  capacity?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoomPayload {
  code?: string;
  name: string;
  type?: string;
  capacity?: number;
  description?: string;
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

export interface Asset {
  id: number;
  code?: string;
  name: string;
  category?: string;
  status?: string;
  acquired_at?: string;
  value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssetPayload {
  code?: string;
  name: string;
  category?: string;
  status?: string;
  acquired_at?: string;
  value?: number;
}

export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}

export interface Maintenance {
  id: number;
  asset_id?: number;
  room_id?: number;
  description?: string | null;
  status?: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaintenancePayload {
  asset_id?: number;
  room_id?: number;
  description?: string;
  status?: string;
  scheduled_at?: string;
  completed_at?: string;
}

export interface UpdateMaintenancePayload extends Partial<CreateMaintenancePayload> {}

export interface Inventory {
  id: number;
  code?: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  min_stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInventoryPayload {
  code?: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  min_stock?: number;
}

export interface UpdateInventoryPayload extends Partial<CreateInventoryPayload> {}

export interface StockMovement {
  id: number;
  inventory_id?: number;
  type?: "in" | "out" | "adjustment";
  quantity?: number;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FacilitiesListParams extends ListParams {
  status?: string;
  category?: string;
}
