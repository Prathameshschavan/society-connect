import api from "../libs/axios";
import type { TSignIn } from "../types/user.types";

export const signIn = async ({ email, password }: TSignIn) => {
  return await api.post(
    `${import.meta.env.VITE_AUTH_API_BASE_URL}/token?grant_type=password`,
    {
      email,
      password,
    }
  );
};
