// Counseling — local service with types matching Kesiswaan DB schema
export * from "./types";
export { counselingService } from "./counseling.service";

// Ekstrakurikuler, Prestasi, Pelanggaran — reuse existing development services
export { extracurricularService } from "@/features/development/api/extracurricular.service";
export { achievementService } from "@/features/development/api/achievement.service";
export { violationService } from "@/features/development/api/violation.service";
export type {
  Extracurricular,
  CreateExtracurricularPayload,
  UpdateExtracurricularPayload,
} from "@/features/development/api/types";
export type {
  Achievement,
  CreateAchievementPayload,
  UpdateAchievementPayload,
} from "@/features/development/api/types";
export type {
  Violation,
  CreateViolationPayload,
  UpdateViolationPayload,
} from "@/features/development/api/types";