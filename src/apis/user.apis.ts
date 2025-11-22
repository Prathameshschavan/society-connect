import api from "../libs/axios";

export const addUser = async ({
  email,
  organization_id,
  password,
}: {
  email: string;
  password: string;
  organization_id: string;
}) => {
  return await api.post("user", { email, organization_id, password });
};
