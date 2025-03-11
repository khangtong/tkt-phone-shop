import { useState } from "react";
import Sidebar from "../../Sidebar";

export default function CategoryDashboard() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-3/4 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">
            Quản lý danh mục
          </h2>
          <p>Danh sách danh mục...</p>
        </div>
      </div>
    </div>
  );
}
