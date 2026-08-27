import { api } from "@/lib/api";
import { COMMUNICATION } from "@/lib/api";
import type { ApiEnvelope, ApiMessage } from "@/types";
import type {
  Calendar,
  CommunicationListParams,
  CreateCalendarPayload,
  UpdateCalendarPayload,
} from "./types";

export const calendarService = {
  async list(params?: CommunicationListParams): Promise<ApiEnvelope<Calendar[]>> {
    return api.get<ApiEnvelope<Calendar[]>>(COMMUNICATION.CALENDARS, params);
  },

  async get(id: number | string): Promise<ApiEnvelope<Calendar>> {
    return api.get<ApiEnvelope<Calendar>>(`${COMMUNICATION.CALENDARS}/${id}`);
  },

  async create(payload: CreateCalendarPayload): Promise<ApiEnvelope<Calendar>> {
    return api.post<ApiEnvelope<Calendar>>(COMMUNICATION.CALENDARS, payload);
  },

  async update(
    id: number | string,
    payload: UpdateCalendarPayload,
  ): Promise<ApiEnvelope<Calendar>> {
    return api.put<ApiEnvelope<Calendar>>(`${COMMUNICATION.CALENDARS}/${id}`, payload);
  },

  async remove(id: number | string): Promise<ApiMessage> {
    return api.delete<ApiMessage>(`${COMMUNICATION.CALENDARS}/${id}`);
  },
};
