"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import UserSidebar from "@/components/user-sidebar";
import { apiService, TravelPlan } from "@/lib/api";

export default function UserPlansPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      router.push("/");
      return;
    }
    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.role !== "USER") {
        router.push("/");
        return;
      }
    } catch {
      router.push("/");
      return;
    }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) fetchPlans();
  }, [token]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTravelPlans(token!);
      setPlans(data);
    } catch (err) {
      setError("Không thể tải danh sách kế hoạch");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      setError("Vui lòng nhập tên kế hoạch");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newPlan = await apiService.createTravelPlan(newPlanName, token!);
      setPlans([newPlan, ...plans]);
      setNewPlanName("");
      setIsCreating(false);
    } catch (err) {
      setError("Không thể tạo kế hoạch mới");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa kế hoạch này?")) return;

    try {
      await apiService.deleteTravelPlan(planId, token!);
      setPlans(plans.filter((p) => p.id !== planId));
    } catch (err) {
      console.error("Lỗi khi xóa kế hoạch:", err);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <UserSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 
                className="text-xl sm:text-2xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Kế hoạch du lịch
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Tạo và quản lý các chuyến đi của bạn
              </p>
            </div>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Tạo kế hoạch mới</span>
                <span className="sm:hidden">Tạo mới</span>
              </button>
            )}
          </div>

          {/* Create Form */}
          {isCreating && (
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <form onSubmit={handleCreatePlan} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Tên kế hoạch (ví dụ: Chuyến đi Vũng Tàu)"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  autoFocus
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newPlanName.trim()}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? "Đang tạo..." : "Tạo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewPlanName("");
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-10 h-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300"></div>
                  <div className="animate-spin absolute top-0 left-0 w-10 h-10 rounded-full border-4 border-transparent border-t-gray-900 border-r-gray-900"></div>
                </div>
                <p className="text-gray-600">Đang tải kế hoạch...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && plans.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có kế hoạch nào</h3>
              <p className="text-gray-600 mb-6">
                Bắt đầu bằng cách tạo một kế hoạch mới để lên lịch trình cho chuyến đi của bạn
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo kế hoạch
              </button>
            </div>
          )}

          {/* Plans Grid */}
          {!loading && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Link key={plan.id} href={`/user/plans/${plan.id}`}>
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 h-20 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
                          <circle cx="50" cy="30" r="20" stroke="white" strokeWidth="2" />
                          <circle cx="150" cy="70" r="15" stroke="white" strokeWidth="2" />
                          <path d="M 30 60 Q 100 20 170 60" stroke="white" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {plan.item_count || 0} địa điểm
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeletePlan(plan.id, e)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded flex-shrink-0"
                          title="Xóa kế hoạch"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Tạo ngày {new Date(plan.created_at).toLocaleDateString("vi-VN")}
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
