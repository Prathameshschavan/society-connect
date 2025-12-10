import api from "../libs/axios";

export const uploadFile = async (file: File, organization_id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("organization_id", organization_id);

  return await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};