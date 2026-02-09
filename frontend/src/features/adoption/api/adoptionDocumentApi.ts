import { api } from "@/shared/api/client";
import type {
  DocumentType,
  UploadItem,
} from "@/features/adoption/types/adoptionDocuments";

type DocumentTypeRequest = {
  documentTypes: Record<string, DocumentType>;
};

export async function uploadAdoptionDocuments(
  adoptionId: number,
  items: UploadItem[]
): Promise<string> {
  const formData = new FormData();
  const mapping: Record<string, DocumentType> = {};

  items.forEach((item, index) => {
    formData.append("files", item.file);
    mapping[`files[${index}]`] = item.type;
  });

  const payload: DocumentTypeRequest = { documentTypes: mapping };
  formData.append(
    "documentTypes",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  return api<string>(`/adoptions/${adoptionId}/documents`, {
    method: "POST",
    body: formData,
  });
}
