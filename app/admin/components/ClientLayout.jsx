"use client";

import Sidebar from "./Sidebar";
import AdminAuthWrapper from "../../../components/AdminAuthWrapper";

export default function ClientLayout({ children }) {
  return (
    <AdminAuthWrapper>
      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
