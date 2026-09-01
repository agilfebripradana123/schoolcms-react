import type { ListParams } from "@/types";

export type ActiveStatus = "active" | "inactive";

export interface FacilitiesListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FacilitiesPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: FacilitiesListMeta;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  capacity: number;
  location?: string | null;
  has_computer: boolean;
  status: ActiveStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoomPayload {
  code: string;
  name: string;
  capacity: number;
  location?: string | null;
  has_computer: boolean;
  status: ActiveStatus;
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

export type AssetCategory =
  | "electronics"
  | "furniture"
  | "lab_equipment"
  | "sports"
  | "teaching_aids"
  | "office"
  | "other";

export type AssetCondition = "good" | "fair" | "poor" | "damaged";

export interface Asset {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  category: AssetCategory;
  quantity: number;
  condition: AssetCondition;
  location?: string | null;
  room_id?: number | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  status: ActiveStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssetPayload {
  code: string;
  name: string;
  description?: string | null;
  category: AssetCategory;
  quantity: number;
  condition: AssetCondition;
  location?: string | null;
  room_id?: number | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  status: ActiveStatus;
}

export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}

export type MaintenanceType = "corrective" | "preventive" | "emergency" | "inspection";

export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Maintenance {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  asset_id?: number | null;
  room_id?: number | null;
  reported_by?: string | null;
  maintenance_type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduled_date?: string | null;
  started_date?: string | null;
  completed_date?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  notes?: string | null;
  resolution?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaintenancePayload {
  code: string;
  title: string;
  description?: string | null;
  asset_id?: number | null;
  room_id?: number | null;
  reported_by?: string | null;
  maintenance_type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduled_date?: string | null;
  started_date?: string | null;
  completed_date?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  notes?: string | null;
  resolution?: string | null;
}

export interface UpdateMaintenancePayload extends Partial<CreateMaintenancePayload> {}

export type InventoryCategory =
  | "stationery"
  | "electronics_supplies"
  | "cleaning"
  | "lab_supplies"
  | "office_supplies"
  | "other";

export interface Inventory {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minimum_stock: number;
  location?: string | null;
  room_id?: number | null;
  status: ActiveStatus;
  is_low_stock: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInventoryPayload {
  code: string;
  name: string;
  description?: string | null;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minimum_stock: number;
  location?: string | null;
  room_id?: number | null;
  status: ActiveStatus;
}

export interface UpdateInventoryPayload extends Partial<CreateInventoryPayload> {}

export type StockMovementType = "stock_in" | "stock_out" | "adjustment";

export type AdjustmentType = "increase" | "decrease";

export interface StockMovement {
  id: number;
  inventory_id: number;
  type: StockMovementType;
  quantity: number;
  adjustment_type?: AdjustmentType | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StockInOutPayload {
  quantity: number;
  notes?: string;
  created_by?: string;
}

export interface AdjustmentPayload {
  quantity: number;
  adjustment_type: AdjustmentType;
  notes: string;
  created_by?: string;
}

export interface FacilitiesListParams extends ListParams {
  status?: string;
  category?: string;
  condition?: string;
  priority?: string;
  maintenance_type?: string;
  room_id?: number;
  has_computer?: boolean;
  low_stock?: boolean;
}