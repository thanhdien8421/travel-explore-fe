# 🚀 DEMO NHANH - Travel Explore

## Chạy Demo Trong 30 Giây

```bash
# 1. Cài đặt
npm install

# 2. Chạy
npm run dev

# 3. Mở trình duyệt
http://localhost:3000/locations/add
```

## ✨ Điền Form Thử Nghiệm

### Dữ Liệu Mẫu 1: Quán Cafe
```
Tên: Cafe The Workshop
Mô tả: Quán cafe phong cách công nghiệp, view đẹp, wifi mạnh
Địa chỉ: 27 Đinh Tiên Hoàng, Quận 1, TP.HCM
Quận: Quận 1
Thành phố: TP.HCM
Giờ mở cửa: 7:00 - 23:00
Giá: 50.000đ - 150.000đ
Liên hệ: 028 3824 6801
Mẹo: Tầng 2 view đẹp hơn, nên đến sáng sớm
```

### Dữ Liệu Mẫu 2: Nhà Hàng
```
Tên: Quán Ăn Ngon 138
Mô tả: Nhà hàng ẩm thực truyền thống Việt Nam
Địa chỉ: 138 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM
Quận: Quận 1
Thành phố: TP.HCM
Giờ mở cửa: 10:00 - 22:00
Giá: 100.000đ - 300.000đ
Liên hệ: 028 3825 7179
Mẹo: Đặt bàn trước, nhất là cuối tuần
```

### Dữ Liệu Mẫu 3: Địa Điểm Du Lịch
```
Tên: Bảo Tàng Thành Phố Hồ Chí Minh
Mô tả: Bảo tàng lịch sử trong toà nhà cổ kiến trúc Pháp
Địa chỉ: 65 Lý Tự Trọng, Quận 1, TP.HCM
Quận: Quận 1
Thành phố: TP.HCM
Giờ mở cửa: 8:00 - 17:00 (đóng cửa thứ 2)
Giá: 30.000đ
Liên hệ: 028 3829 9741
Mẹo: Có hướng dẫn viên tiếng Anh, nên đến buổi sáng
```

## 📱 Các Bước Demo

1. ✅ Điền thông tin trong tab "Thông tin"
2. ✅ Upload ảnh (kéo thả hoặc click chọn)
3. ✅ (Tùy chọn) Chọn tọa độ trong tab "Bản đồ"
4. ✅ Click "Thêm địa điểm"
5. 🎉 Xem JSON Preview!

## 📋 Copy JSON Nhanh

Sau khi submit:
1. Click nút "📋 Copy JSON"
2. Paste vào editor để xem
3. Gửi cho Backend team

## 🎯 Điểm Quan Trọng Để Demo

### 1. Upload Ảnh Demo Mode
- Kéo thả ảnh → Thấy preview
- Không cần Supabase → Vẫn hoạt động
- Badge vàng hiện "🧪 Demo Mode"

### 2. Bản Đồ Tương Tác
- Click "Bản đồ" tab
- Thử 3 cách chọn tọa độ:
  - 🔍 Tìm kiếm
  - 📍 GPS
  - 🖱️ Click trên bản đồ

### 3. JSON Preview
- Cấu trúc rõ ràng
- Copy dễ dàng
- Có note giải thích

## ⚡ Troubleshooting Nhanh

### Port đã sử dụng?
```bash
# Server sẽ tự chuyển sang port khác (3001, 3002...)
# Xem trong terminal output
```

### Upload ảnh không hoạt động?
```
→ Bình thường! Demo mode không upload thật
→ Chỉ show preview và generate mock URL
```

### Bản đồ không hiện?
```
→ Chờ vài giây để load
→ Kiểm tra internet connection
```

## 📊 JSON Output Mẫu

```json
{
  "name": "Cafe The Workshop",
  "description": "Quán cafe phong cách công nghiệp...",
  "address_text": "27 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  "cover_image_url": "https://demo-storage...",
  "district": "Quận 1",
  "city": "TP.HCM",
  "opening_hours": "7:00 - 23:00",
  "price_info": "50.000đ - 150.000đ",
  "contact_info": "028 3824 6801",
  "tips_notes": "Tầng 2 view đẹp hơn...",
  "is_featured": false,
  "latitude": 10.7779,
  "longitude": 106.7009,
  "coordinates_source": "manual_selection"
}
```

## 💡 Tips Demo Hiệu Quả

### Cho Frontend:
1. Chuẩn bị 2-3 bộ dữ liệu mẫu
2. Test trước khi demo
3. Giải thích từng bước
4. Focus vào JSON output

### Cho Backend:
1. Quan sát cấu trúc JSON
2. Note lại các trường bắt buộc/tùy chọn
3. Hỏi về logic tọa độ
4. Copy JSON để test API

## 📚 Đọc Thêm

- **Chi tiết đầy đủ**: `HUONG_DAN_DEMO_CHO_BACKEND.md`
- **Kỹ thuật**: `JSON_PREVIEW_FEATURE.md`
- **Setup Supabase**: `SUPABASE_SETUP.md`

## ✅ Checklist Demo

- [ ] Server đã chạy
- [ ] Mở đúng URL `/locations/add`
- [ ] Chuẩn bị dữ liệu mẫu
- [ ] Có ảnh để upload demo
- [ ] Backend team đã sẵn sàng
- [ ] Screen share/projector ready

## 🎉 Kết Quả Mong Đợi

Sau demo, Backend team sẽ:
- ✅ Hiểu rõ cấu trúc JSON
- ✅ Biết các trường cần xử lý
- ✅ Hiểu logic tọa độ
- ✅ Sẵn sàng implement API

---

**Good luck! 🚀**