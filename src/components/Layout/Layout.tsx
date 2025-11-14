import React, { type ReactNode } from "react";
import TopNav from "../TopNav";
import PageTopSection from "../PageTopSection";
import type { TRole } from "../../types/user.types";

const Layout: React.FC<{ children: ReactNode; role: TRole }> = ({
  children,
  role,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view={role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ">
        <div className="space-y-5">
          <PageTopSection />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
