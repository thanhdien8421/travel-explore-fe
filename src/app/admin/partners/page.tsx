"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import AdminSidebar from "@/components/admin-sidebar";
import { apiService, PartnerLead as ApiPartnerLead } from "@/lib/api";

// Local interface with both camelCase and snake_case for compatibility
interface PartnerLead {
  id: string;
  businessName: string;
  business_name?: string;
  contactName: string;
  contact_name?: string;
  phone: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  created_at?: string;
}

export default function AdminPartnersPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<PartnerLead | null>(null);
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.role !== "ADMIN") {
        router.push("/");
        return;
      }
    } catch (err) {
      router.push("/");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchPartnerLeads();
    }
  }, [token, page]);

  const fetchPartnerLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllPartnerLeads({ page, limit: 10 }, token || undefined);
      setLeads(response.data as unknown as PartnerLead[]);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đối tác");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!token || !confirm("Bạn chắc chắn muốn xóa?")) return;

    setIsDeleting(leadId);
    try {
      await apiService.deletePartnerLead(leadId, token);
      fetchPartnerLeads();
    } catch (err) {
      setError("Lỗi khi xóa đối tác");
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleContact = (lead: PartnerLead) => {
    window.location.href = `mailto:${lead.email}`;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !showCreateModal || !password) return;

    setIsCreating(true);
    try {
      await apiService.createPartnerAccount(showCreateModal.id, password, token);
      setSuccess(`Đã tạo tài khoản đối tác cho ${showCreateModal.contact_name}`);
      setShowCreateModal(null);
      setPassword("");
      fetchPartnerLeads();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Lỗi khi tạo tài khoản");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-[rgb(252,252,252)]" style={{ scrollbarGutter: 'stable' }}>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 lg:px-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Đối tác
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Quản lý các yêu cầu đối tác từ các chủ doanh nghiệp
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
                <button onClick={() => setError(null)} className="ml-2 underline">Đóng</button>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
                    <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">Không có yêu cầu đối tác nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Doanh nghiệp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Người liên hệ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Điện thoại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Ngày đăng ký
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {lead.businessName || lead.business_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {lead.contactName || lead.contact_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {lead.phone}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {lead.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(lead.createdAt || lead.created_at || new Date()).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setShowCreateModal(lead)}
                                title="Tạo tài khoản"
                                className="w-9 h-9 flex items-center justify-center border border-green-500 text-green-500 bg-white rounded-lg hover:bg-green-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleContact(lead)}
                                title="Liên hệ"
                                className="w-9 h-9 flex items-center justify-center border border-blue-500 text-blue-500 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(lead.id)}
                                disabled={isDeleting === lead.id}
                                title="Xóa"
                                className="w-9 h-9 flex items-center justify-center border border-red-500 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Partner Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Tạo tài khoản đối tác
                </h2>
                <p className="text-sm text-gray-500">Cấp quyền truy cập cho đối tác mới</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(null);
                  setPassword("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Partner Info Card */}
            <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{showCreateModal.business_name}</p>
                  <p className="text-sm text-gray-600">{showCreateModal.contact_name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {showCreateModal.email}
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu cho tài khoản
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mật khẩu sẽ được gửi cho đối tác qua email
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(null);
                    setPassword("");
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating || password.length < 6}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
