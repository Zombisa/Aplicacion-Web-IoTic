import { BaseProductivityDTO } from "./BaseProductivityDTO";

export interface FormSubmitPayload {
  data: BaseProductivityDTO;
  file_image?: File | null;
  file_document?: File | null;
}