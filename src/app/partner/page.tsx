"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import { apiService } from "@/lib/api";

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.registerPartner(formData);

      setSubmitted(true);
      setFormData({
        businessName: "",
        contactName: "",
        phone: "",
        email: "",
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(250,250,250)]">
      <NavBar />

      {/* Hero Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hợp tác cùng Travel Explore
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Mở rộng kinh doanh của bạn - Tiếp cận hàng triệu du khách trẻ đang tìm kiếm trải nghiệm mới
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Miễn phí đăng ký</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Truy cập 1M+ khách hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Quản lý dễ dàng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Tại sao chọn Travel Explore?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-full">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
                Tăng doanh thu
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-center">
                Tiếp cận hàng triệu khách du lịch trẻ, năng động tìm kiếm trải nghiệm mới
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="p-3 sm:p-4 bg-green-50 rounded-full">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
                Hình ảnh chuyên nghiệp
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-center">
                Hiển thị doanh nghiệp với ảnh đẹp, thông tin chi tiết và đánh giá từ khách hàng thực
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="p-3 sm:p-4 bg-purple-50 rounded-full">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
                Dữ liệu khách hàng
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-center">
                Theo dõi nhu cầu khách hàng, phân tích xu hướng và tối ưu hóa chiến lược kinh doanh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Đăng ký tư vấn miễn phí
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để thảo luận về cơ hội hợp tác
            </p>
          </div>

          <div className="bg-[rgb(250,250,250)] rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Cảm ơn bạn!
                </h3>
                <p className="text-green-700">
                  Chúng tôi sẽ liên hệ với bạn trong 24 giờ
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên doanh nghiệp
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Quán cà phê Hạnh Phúc"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên người liên hệ
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="0xxx xxx xxx"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang gửi..." : "Đăng ký tư vấn"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Chúng tôi sẽ không chia sẻ thông tin của bạn với bất kỳ bên thứ ba nào
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <img src="/logo.png" alt="Travel Explore Logo" className="h-16 w-auto mr-3 mb-2 rounded-2xl" />
                </Link>
              </div>
              <p className="text-gray-400 mb-4 max-w-md text-sm">
                Khám phá những điểm đến mới mẻ và những trải nghiệm độc đáo <br /> tại Việt Nam cùng chúng tôi.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Trang chủ</Link></li>
                <li><Link href="/locations" className="text-gray-400 hover:text-white transition-colors">Địa điểm</Link></li>
                <li><Link href="/partner" className="text-gray-400 hover:text-white transition-colors">Trở thành đối tác</Link></li>
                {/* <li><Link href="/locations/add" className="text-gray-400 hover:text-white transition-colors">Thêm địa điểm</Link></li>
                <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Quản lý</Link></li> */}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@travelexplore.vn</li>
                <li>Phone: +84 123 456 789</li>
                <li>Địa chỉ: TP. Hồ Chí Minh, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Travel Explore. All right reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
