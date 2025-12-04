"use client";

import { useState, useEffect } from "react";
import { PlaceSummary, TravelPlan, apiService } from "@/lib/api";

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: PlaceSummary;
}

export default function AddToPlanModal({ isOpen, onClose, place }: AddToPlanModalProps) {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch plans on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        fetchPlans(token);
      }
    }
  }, [isOpen]);

  const fetchPlans = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getTravelPlans(token);
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlanId(data[0].id);
      }
    } catch (err) {
      setError("Không thể tải danh sách kế hoạch");
      console.error(err);
    } finally {
      setIsLoading(false);
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
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Vui lòng đăng nhập");
        return;
      }
      const newPlan = await apiService.createTravelPlan(newPlanName, token);
      setPlans([...plans, newPlan]);
      setSelectedPlanId(newPlan.id);
      setNewPlanName("");
      setIsCreatingPlan(false);
    } catch (err) {
      setError("Không thể tạo kế hoạch mới");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToplan = async () => {
    if (!selectedPlanId) {
      setError("Vui lòng chọn hoặc tạo một kế hoạch");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Vui lòng đăng nhập");
        return;
      }
      await apiService.addPlaceToTravelPlan(selectedPlanId, place.id, token);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError("Không thể thêm địa điểm vào kế hoạch");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Lưu vào kế hoạch
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-300 text-sm">{place.name}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">Đã thêm vào kế hoạch!</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent mb-3"></div>
              <p className="text-sm text-gray-600">Đang tải kế hoạch...</p>
            </div>
          )}

          {/* Plans List */}
          {!isLoading && plans.length > 0 && !isCreatingPlan && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Chọn kế hoạch
                </label>
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPlanId === plan.id
                        ? "border-gray-900 bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-4 h-4 text-gray-900"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-xs text-gray-500">{plan.item_count || 0} địa điểm</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500 font-medium">HOẶC</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </>
          )}

          {/* Create New Plan Form */}
          {isCreatingPlan || plans.length === 0 ? (
            <>
              {plans.length > 0 && isCreatingPlan && (
                <button
                  onClick={() => setIsCreatingPlan(false)}
                  className="w-full text-left text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại
                </button>
              )}
              <form onSubmit={handleCreatePlan} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {plans.length === 0 ? "Tạo kế hoạch mới" : "Tên kế hoạch mới"}
                  </label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="Ví dụ: Chuyến đi Vũng Tàu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPlanName.trim()}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : "Tạo kế hoạch"}
                </button>
              </form>
            </>
          ) : (
            <button
              onClick={() => setIsCreatingPlan(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:text-gray-900 hover:border-gray-900 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo kế hoạch mới
            </button>
          )}
        </div>

        {/* Footer */}
        {!isCreatingPlan && plans.length > 0 && (
          <div className="border-t border-gray-200 p-4 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium transition-all duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleAddToplan}
              disabled={isSubmitting || !selectedPlanId}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Đang lưu...</span>
                </>
              ) : "Lưu"}
            </button>
          </div>
        )}

        {/* Footer for Create Plan */}
        {isCreatingPlan && plans.length > 0 && (
          <div className="border-t border-gray-200 p-4 flex gap-3">
            <button
              onClick={() => {
                setIsCreatingPlan(false);
                setNewPlanName("");
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium transition-all duration-200"
            >
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
