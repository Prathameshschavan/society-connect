import React from "react";
import { useProfileStore } from "../libs/stores/useProfileStore";

const PageTopSection: React.FC = () => {
  const { profile } = useProfileStore();
  return (
    <div>
      <h1 className="text-2xl poppins-medium ">
        {profile?.organization?.name}
      </h1>
      <p className="text-sm poppins-light">
        {[
          ...(profile?.organization?.address_line_1 ? [profile?.organization?.address_line_1] : []),
          ...(profile?.organization?.address_line_2 ? [profile?.organization?.address_line_2] : []),
          ...(profile?.organization?.city ? [profile?.organization?.city] : []),
          ...(profile?.organization?.state ? [profile?.organization?.state] : []),
          ...(profile?.organization?.pincode ? [profile?.organization?.pincode] : []),
        ].join(", ")}
      </p>
    </div>
  );
};

export default PageTopSection;
