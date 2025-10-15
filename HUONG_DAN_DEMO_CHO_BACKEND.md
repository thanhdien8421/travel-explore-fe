# Tài Liệu Hướng Dẫn Demo - Travel Explore Frontend

## 📋 Tổng Quan

Đây là tài liệu hướng dẫn cho **team Backend** về cách chạy demo ứng dụng Travel Explore Frontend và hiểu rõ các yêu cầu API cần phát triển.

---

## 🎯 Mục Đích Demo

Demo này sẽ cho team Backend thấy:
- ✅ Giao diện người dùng hoàn chỉnh
- ✅ Luồng tạo địa điểm mới
- ✅ Cấu trúc dữ liệu JSON sẽ được gửi lên API
- ✅ Các trường thông tin bắt buộc và tùy chọn
- ✅ Cách xử lý tọa độ (coordinates) và địa chỉ

---

## 🚀 Cách Chạy Demo

### Bước 1: Cài Đặt Dependencies
```bash
cd travel-explore-fe
npm install
```

### Bước 2: Chạy Development Server
```bash
npm run dev
```

Server sẽ chạy ở: **http://localhost:3000** (hoặc port khác nếu 3000 đã được sử dụng)

### Bước 3: Truy Cập Trang Thêm Địa Điểm
Mở trình duyệt và vào: **http://localhost:3000/locations/add**

---

## 📱 Hướng Dẫn Sử Dụng Demo

### 1. Điền Thông Tin Cơ Bản (Tab "Thông tin")
- **Tên địa điểm** (bắt buộc): VD: "Cafe The Workshop"
- **Mô tả** (bắt buộc): VD: "Quán cafe phong cách hiện đại, view đẹp"
- **Địa chỉ** (bắt buộc): VD: "27 Đinh Tiên Hoàng, Quận 1, TP.HCM"
- **Ảnh bìa** (bắt buộc): Kéo thả hoặc chọn file ảnh
  - ⚠️ **Lưu ý**: Hiện tại chạy ở chế độ demo, upload ảnh sẽ được mô phỏng
- **Quận/Huyện** (tùy chọn): VD: "Quận 1"
- **Thành phố** (tùy chọn): VD: "TP.HCM"
- **Giờ mở cửa** (tùy chọn): VD: "8:00 - 22:00"
- **Thông tin giá** (tùy chọn): VD: "50.000đ - 150.000đ"
- **Liên hệ** (tùy chọn): VD: "0901234567"
- **Ghi chú/Mẹo** (tùy chọn): VD: "Nên đặt chỗ trước vào cuối tuần"

### 2. Chọn Tọa Độ (Tab "Bản đồ") - TÙY CHỌN
- Click vào tab "Bản đồ"
- Sử dụng một trong các cách:
  - **Tìm kiếm địa chỉ**: Nhập địa chỉ và chọn từ gợi ý
  - **Sử dụng vị trí hiện tại**: Click nút "📍 Vị trí hiện tại"
  - **Click trực tiếp trên bản đồ**: Click vào vị trí bạn muốn chọn
- Địa chỉ sẽ tự động cập nhật khi chọn tọa độ

### 3. Submit Form
- Click nút **"Thêm địa điểm"**
- Chờ 1 giây (mô phỏng thời gian gọi API)
- Xem kết quả!

---

## 📊 Kết Quả Demo - JSON Preview

Sau khi submit, bạn sẽ thấy một khung màu đen hiển thị **JSON Request** mà Frontend sẽ gửi cho Backend.

### Ví Dụ JSON:

```json
{
  "name": "Cafe The Workshop",
  "description": "Quán cafe phong cách hiện đại, view đẹp, phù hợp cho làm việc và hẹn hò",
  "address_text": "27 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  "cover_image_url": "https://demo-storage.supabase.co/storage/v1/object/public/travel-images/locations/1729012345678-cafe.jpg",
  "district": "Quận 1",
  "city": "TP.HCM",
  "opening_hours": "8:00 - 22:00",
  "price_info": "50.000đ - 150.000đ",
  "contact_info": "0901234567",
  "tips_notes": "Nên đặt chỗ trước vào cuối tuần",
  "is_featured": false,
  "latitude": 10.7779,
  "longitude": 106.7009,
  "coordinates_source": "manual_selection"
}
```

### Thao Tác Với JSON Preview:
- **📋 Copy JSON**: Click để copy toàn bộ JSON vào clipboard
- **➕ Thêm địa điểm khác**: Reset form để thử với dữ liệu khác
- **✏️ Chỉnh sửa**: Ẩn preview để chỉnh sửa form

---

## 🔧 Yêu Cầu API Cho Backend

### Endpoint Cần Phát Triển

```
POST /api/places
```

### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body Schema

#### Trường BẮT BUỘC:
| Tên Field | Kiểu | Mô Tả | Ví Dụ |
|-----------|------|-------|-------|
| `name` | string | Tên địa điểm | "Cafe The Workshop" |
| `description` | string | Mô tả chi tiết | "Quán cafe phong cách..." |
| `address_text` | string | Địa chỉ đầy đủ | "27 Đinh Tiên Hoàng, Q1, HCM" |
| `cover_image_url` | string | URL ảnh bìa | "https://..." |

#### Trường TÙY CHỌN:
| Tên Field | Kiểu | Mô Tả | Ví Dụ |
|-----------|------|-------|-------|
| `district` | string \| undefined | Quận/Huyện | "Quận 1" |
| `city` | string \| undefined | Thành phố | "TP.HCM" |
| `opening_hours` | string \| undefined | Giờ mở cửa | "8:00 - 22:00" |
| `price_info` | string \| undefined | Thông tin giá | "50k - 150k" |
| `contact_info` | string \| undefined | Liên hệ | "0901234567" |
| `tips_notes` | string \| undefined | Ghi chú | "Nên đặt chỗ trước..." |
| `is_featured` | boolean | Địa điểm nổi bật | false |
| `latitude` | number \| undefined | Vĩ độ | 10.7779 |
| `longitude` | number \| undefined | Kinh độ | 106.7009 |
| `coordinates_source` | string \| undefined | Nguồn tọa độ | "manual_selection" \| "geocoded" |

---

## 🎯 Logic Xử Lý Tọa Độ - QUAN TRỌNG!

Backend cần xử lý tọa độ theo logic sau:

### Trường Hợp 1: User Chọn Tọa Độ Trên Bản Đồ
```json
{
  "address_text": "27 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  "latitude": 10.7779,
  "longitude": 106.7009,
  "coordinates_source": "manual_selection"
}
```
**→ Backend PHẢI SỬ DỤNG tọa độ này (user đã chọn chính xác)**

### Trường Hợp 2: User KHÔNG Chọn Tọa Độ
```json
{
  "address_text": "27 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  "latitude": undefined,
  "longitude": undefined,
  "coordinates_source": undefined
}
```
**→ Backend CẦN GEOCODE từ `address_text` để lấy tọa độ**

### Tại Sao Có 2 Cách?
- ✅ **Tốt hơn**: User chọn tọa độ trên bản đồ → Chính xác 100%
- ✅ **Chấp nhận được**: User chỉ nhập địa chỉ → Backend geocode → Có thể sai lệch vị trí

---

## 📝 Response Mong Đợi Từ Backend

### Success Response (201 Created)
```json
{
  "id": 123,
  "name": "Cafe The Workshop",
  "description": "Quán cafe phong cách...",
  "address_text": "27 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  "cover_image_url": "https://...",
  "latitude": 10.7779,
  "longitude": 106.7009,
  "district": "Quận 1",
  "city": "TP.HCM",
  "opening_hours": "8:00 - 22:00",
  "price_info": "50.000đ - 150.000đ",
  "contact_info": "0901234567",
  "tips_notes": "Nên đặt chỗ trước...",
  "is_featured": false,
  "created_at": "2025-10-15T10:30:00Z",
  "updated_at": "2025-10-15T10:30:00Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Validation Error",
  "message": "Trường 'name' là bắt buộc",
  "fields": {
    "name": "Không được để trống"
  }
}
```

### Error Response (500 Internal Server Error)
```json
{
  "error": "Server Error",
  "message": "Không thể geocode địa chỉ"
}
```

---

## 🔗 API Endpoints Khác Cần Phát Triển

Để ứng dụng hoạt động hoàn chỉnh, Backend cần các endpoints sau:

### 1. Lấy Danh Sách Địa Điểm
```
GET /api/places
Query params:
  - page (number, optional)
  - limit (number, optional)
  - city (string, optional)
  - is_featured (boolean, optional)
```

### 2. Lấy Chi Tiết Địa Điểm
```
GET /api/places/:id
```

### 3. Cập Nhật Địa Điểm
```
PUT /api/places/:id
Body: Same as POST /api/places
```

### 4. Xóa Địa Điểm
```
DELETE /api/places/:id
```

---

## 🛠️ Setup Môi Trường (Sau Này)

### Frontend Cần:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  # URL Backend API
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### Backend Cần:
- Database để lưu thông tin địa điểm
- Geocoding service để chuyển địa chỉ thành tọa độ (Google Maps API hoặc OpenStreetMap Nominatim)
- CORS configuration cho phép Frontend gọi API

---

## 💡 Lưu Ý Khi Phát Triển API

### 1. Validation
- Kiểm tra các trường bắt buộc: `name`, `description`, `address_text`, `cover_image_url`
- Validate định dạng:
  - Email nếu có trong `contact_info`
  - URL cho `cover_image_url`
  - Số điện thoại Việt Nam nếu có

### 2. Xử Lý Tọa Độ
- Nếu có `latitude` và `longitude` → Lưu trực tiếp
- Nếu không có → Gọi geocoding service
- Lưu cả `coordinates_source` để biết nguồn gốc tọa độ

### 3. Error Handling
- Trả về mã lỗi rõ ràng (400, 404, 500)
- Message lỗi bằng tiếng Việt
- Chi tiết lỗi validation cho từng field

### 4. Performance
- Index database cho các trường thường tìm kiếm: `city`, `district`, `is_featured`
- Cache danh sách địa điểm nếu cần

### 5. Security
- Validate và sanitize tất cả input
- Kiểm tra URL ảnh có hợp lệ
- Rate limiting để tránh spam

---

## 📞 Liên Hệ & Câu Hỏi

Nếu có bất kỳ câu hỏi nào về:
- Cấu trúc JSON
- Logic xử lý
- Yêu cầu API
- Demo không hoạt động

Hãy liên hệ team Frontend để được hỗ trợ!

---

## ✅ Checklist Cho Backend

- [ ] Đã chạy được demo frontend
- [ ] Đã hiểu rõ cấu trúc JSON request
- [ ] Đã hiểu logic xử lý tọa độ
- [ ] Đã thiết kế database schema
- [ ] Đã setup geocoding service
- [ ] Đã implement endpoint `POST /api/places`
- [ ] Đã test với data từ demo
- [ ] Đã implement các endpoint khác (GET, PUT, DELETE)
- [ ] Đã setup CORS cho phép frontend gọi API
- [ ] Đã viết API documentation

---

## 🎉 Kết Luận

Demo này cho phép team Backend:
1. ✅ Thấy được giao diện và trải nghiệm người dùng
2. ✅ Hiểu rõ dữ liệu Frontend sẽ gửi lên
3. ✅ Biết được các trường hợp cần xử lý
4. ✅ Có ví dụ JSON cụ thể để test API

**Frontend đã sẵn sàng!** Backend team có thể bắt đầu phát triển API dựa trên tài liệu này.

---

*Cập nhật lần cuối: 15/10/2025*