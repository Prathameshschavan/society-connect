import React from "react";
import { useProfileStore } from "../libs/stores/useProfileStore";

const PageTopSection: React.FC = () => {
  const { profile } = useProfileStore();
  return (
    <div>
      <h1 className="text-2xl poppins-medium ">
        {profile?.organization?.name}
      </h1>
      <p className="text-sm poppins-light">{profile?.organization?.address_line_1}</p>
      <p className="text-sm poppins-light">{profile?.organization?.address_line_2}</p>
      <p className="text-sm poppins-light">{profile?.organization?.city}</p>
      <p className="text-sm poppins-light">{profile?.organization?.state}</p>
      <p className="text-sm poppins-light">{profile?.organization?.pincode}</p>
    </div>
  );
};

export default PageTopSection;
