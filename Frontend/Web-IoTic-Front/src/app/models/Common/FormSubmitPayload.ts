import { BaseProductivityDTO } from "./BaseProductivityDTO";

export interface FormSubmitPayload {
  data: BaseProductivityDTO;
  file: File | null;
}