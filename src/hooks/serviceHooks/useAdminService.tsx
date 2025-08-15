import { useProfileStore } from "../../libs/stores/useProfileStore";
import { supabase } from "../../libs/supabase/supabaseClient";

const useAdminService = () => {
  const { profile, setResidents } = useProfileStore();
  const fetchResidents = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", profile?.organization_id);

      setResidents(data as never);

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  return { fetchResidents };
};

export default useAdminService;
