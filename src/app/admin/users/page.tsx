"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import AdminSidebar from "@/components/admin-sidebar";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { apiService } from "@/lib/api";

type UserRole = "ADMIN" | "USER" | "PARTNER" | "CONTRIBUTOR";

interface UserData {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    reviews: number;
    createdPlaces: number;
    bookings: number;
  };
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    ADMIN: number;
    USER: number;
    PARTNER: number;
    CONTRIBUTOR: number;
  };
  // Legacy fields for backward compatibility
  total?: number;
  active?: number;
  inactive?: number;
  ADMIN?: number;
  USER?: number;
  PARTNER?: number;
  CONTRIBUTOR?: number;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  USER: "Người dùng",
  PARTNER: "Đối tác",
  CONTRIBUTOR: "Cộng tác viên",
};

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  USER: "bg-gray-100 text-gray-800",
  PARTNER: "bg-blue-100 text-blue-800",
  CONTRIBUTOR: "bg-green-100 text-green-800",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<UserData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create user form
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "USER" as UserRole,
  });

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
      setCurrentUserId(payload.id);
    } catch (err) {
      router.push("/");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchStats();
    }
  }, [token, page, roleFilter, statusFilter, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers(
        {
          search: search || undefined,
          role: roleFilter || undefined,
          isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
          page,
          limit: 20,
        },
        token || undefined
      );
      setUsers(response.data as unknown as UserData[]);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getUserStats(token || undefined);
      setStats(response as unknown as UserStats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsProcessing(true);
    try {
      await apiService.createUser(newUser, token);
      setShowCreateModal(false);
      setNewUser({ email: "", password: "", fullName: "", role: "USER" });
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Lỗi khi tạo tài khoản");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!token) return;

    setIsProcessing(true);
    try {
      await apiService.updateUserRole(userId, newRole, token);
      setShowRoleModal(null);
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Lỗi khi cập nhật vai trò");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, permanent: boolean = false) => {
    if (!token) return;

    setIsProcessing(true);
    try {
      await apiService.deleteUser(userId, token, permanent);
      setShowDeleteModal(null);
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Lỗi khi xóa người dùng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (!token) return;

    setIsProcessing(true);
    try {
      await apiService.restoreUser(userId, token);
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Lỗi khi khôi phục người dùng");
    } finally {
      setIsProcessing(false);
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
              <div>
                <h1 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Quản lý người dùng
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Quản lý tài khoản và phân quyền người dùng
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Tạo tài khoản</span>
                <span className="sm:hidden">Tạo</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers ?? stats?.total ?? "--"}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-green-100 p-4">
                <p className="text-sm text-gray-500">Hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeUsers ?? stats?.active ?? "--"}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-red-100 p-4">
                <p className="text-sm text-gray-500">Đã vô hiệu</p>
                <p className="text-2xl font-bold text-red-600">{stats?.inactiveUsers ?? stats?.inactive ?? "--"}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Admin</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.byRole?.ADMIN ?? stats?.ADMIN ?? "--"}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Người dùng</p>
                <p className="text-2xl font-bold text-gray-600">{stats?.byRole?.USER ?? stats?.USER ?? "--"}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Đối tác</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.byRole?.PARTNER ?? stats?.PARTNER ?? "--"}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Cộng tác viên</p>
                <p className="text-2xl font-bold text-green-600">{stats?.byRole?.CONTRIBUTOR ?? stats?.CONTRIBUTOR ?? "--"}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                />
              </div>
              <CustomDropdown
                value={roleFilter}
                onChange={(value) => {
                  setRoleFilter(value as UserRole | "");
                  setPage(1);
                }}
                placeholder="Tất cả vai trò"
                options={[
                  { value: "", label: "Tất cả vai trò" },
                  { value: "ADMIN", label: "Quản trị viên" },
                  { value: "USER", label: "Người dùng" },
                  { value: "PARTNER", label: "Đối tác" },
                  { value: "CONTRIBUTOR", label: "Cộng tác viên" },
                ]}
              />
              <CustomDropdown
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as "" | "active" | "inactive");
                  setPage(1);
                }}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: "", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Đã vô hiệu hóa" },
                ]}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
                <button onClick={() => setError(null)} className="ml-2 underline">
                  Đóng
                </button>
              </div>
            )}

            {/* Users Table */}
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
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500">Không tìm thấy người dùng nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Người dùng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Vai trò
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Hoạt động
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className={`hover:bg-gray-50 ${!user.isActive ? 'bg-red-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div>
                              <p className={`text-sm font-medium ${user.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                {user.fullName || "Chưa cập nhật"}
                              </p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 text-sm font-bold rounded-full ${
                                ROLE_COLORS[user.role]
                              }`}
                            >
                              {ROLE_LABELS[user.role]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 text-sm font-bold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.isActive ? 'Hoạt động' : 'Đã vô hiệu'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span title="Đánh giá">{user._count?.reviews ?? 0} đánh giá</span>
                              <span title="Địa điểm tạo">{user._count?.createdPlaces ?? 0} địa điểm</span>
                              <span title="Đặt chỗ">{user._count?.bookings ?? 0} đặt chỗ</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {user.isActive ? (
                                <>
                                  <button
                                    onClick={() => setShowRoleModal(user)}
                                    title="Đổi vai trò"
                                    className="w-9 h-9 flex items-center justify-center border border-blue-500 text-blue-500 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </button>
                                  {user.id !== currentUserId && (
                                    <button
                                      onClick={() => setShowDeleteModal(user)}
                                      disabled={isProcessing}
                                      title="Xóa"
                                      className="w-9 h-9 flex items-center justify-center border border-red-500 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRestoreUser(user.id)}
                                  disabled={isProcessing}
                                  title="Khôi phục"
                                  className="w-9 h-9 flex items-center justify-center border border-emerald-500 text-emerald-500 bg-white rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              )}
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

      {/* Create User Modal */}
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
                  Tạo tài khoản mới
                </h2>
                <p className="text-sm text-gray-500">Thêm người dùng vào hệ thống</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vai trò
                </label>
                <CustomDropdown
                  value={newUser.role}
                  onChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  placeholder="Chọn vai trò"
                  options={[
                    { value: "USER", label: "Người dùng" },
                    { value: "CONTRIBUTOR", label: "Cộng tác viên" },
                    { value: "PARTNER", label: "Đối tác" },
                    { value: "ADMIN", label: "Quản trị viên" },
                  ]}
                />
              </div>
             
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Tối thiểu 6 ký tự</p>
              </div>


              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
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

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Thay đổi vai trò
                </h2>
                <p className="text-sm text-gray-500">Cập nhật quyền truy cập</p>
              </div>
              <button
                onClick={() => setShowRoleModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{showRoleModal.fullName || showRoleModal.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Vai trò hiện tại:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[showRoleModal.role]}`}>
                      {ROLE_LABELS[showRoleModal.role]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {(["USER", "CONTRIBUTOR", "PARTNER", "ADMIN"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleUpdateRole(showRoleModal.id, role)}
                  disabled={isProcessing || role === showRoleModal.role || (showRoleModal.id === currentUserId && role !== "ADMIN")}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    role === showRoleModal.role
                      ? "border-gray-900 bg-gray-50 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{ROLE_LABELS[role]}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {role === "ADMIN" && "Toàn quyền quản trị hệ thống"}
                        {role === "CONTRIBUTOR" && "Có thể đăng địa điểm (cần duyệt)"}
                        {role === "PARTNER" && "Đối tác kinh doanh"}
                        {role === "USER" && "Người dùng thông thường"}
                      </p>
                    </div>
                    {role === showRoleModal.role && (
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowRoleModal(null)}
                className="w-full px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Xóa người dùng
                </h2>
                <p className="text-sm text-gray-500">Chọn phương thức xóa</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{showDeleteModal.fullName || "Chưa cập nhật"}</p>
                  <p className="text-sm text-gray-600">{showDeleteModal.email}</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-800">
                  <strong>Lưu ý:</strong> Chọn phương thức xóa phù hợp với nhu cầu của bạn.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDeleteUser(showDeleteModal.id, false)}
                disabled={isProcessing}
                className="w-full p-5 text-left rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Vô hiệu hóa (Soft Delete)</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Người dùng không thể đăng nhập nhưng dữ liệu được giữ lại. Có thể khôi phục sau.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDeleteUser(showDeleteModal.id, true)}
                disabled={isProcessing}
                className="w-full p-5 text-left rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">Xóa vĩnh viễn (Hard Delete)</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Xóa hoàn toàn người dùng và tất cả dữ liệu liên quan. Không thể khôi phục!
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="w-full px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
