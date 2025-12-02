import React, { type ReactNode } from "react";
import TopNav from "../TopNav";
import PageTopSection from "../PageTopSection";
import type { TRole } from "../../types/user.types";

const Layout: React.FC<{
  children: ReactNode;
  role: TRole;
  visibileTopSection?: boolean;
  pageHeader?: {
    title: string;
    description: string;
    icon: ReactNode;
  };
}> = ({ children, role, visibileTopSection = true, pageHeader }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view={role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ">
        <div className="space-y-5">
          {visibileTopSection && <PageTopSection />}
          {pageHeader && <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-4 bg-[#0154AC]/10 rounded-lg">
                {pageHeader?.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {pageHeader?.title}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base ">
                  {pageHeader?.description}
                </p>
              </div>
            </div>
          </div>}
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
