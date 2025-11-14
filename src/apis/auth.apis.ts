import { supabase } from "../libs/supabase/supabaseClient";
import type { TSignIn } from "../types/user.types";

export const signIn = async ({ email, password }: TSignIn) => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw Error(error.message);
  }

  return data;
};
