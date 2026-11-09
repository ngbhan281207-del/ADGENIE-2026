# AdGenie — Cuộc thi Vibe Coding 2026

> Các mục dạng `<...>` là thông tin cần đội điền trước khi nộp bài.

## 1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Tên đội thi | `<Tên đội>` |
| Bảng thi | Bảng A - Công nghệ |
| Đề bài bốc thăm | Đề số 2 — Trình tạo caption quảng cáo bằng AI |
| Demo online | `<URL nếu có>` |
| Video demo (≤ 02 phút) | `<URL>` |
| Source ZIP | `<URL tải gói mã nguồn ZIP>` |
| Minh chứng dùng AI | Mục 10 của README này + `<tên tệp ảnh/PDF kèm theo>` |
| Bảng kiểm thử | Mục 11 của README này |

> Tiêu chí vòng loại: https://vibecoding.info.vn/tieu-chi-cham-thi
> Bảng A: ít nhất 6 ca kiểm thử; chỉ dùng Mock thì nhóm A3 tối đa 4/15 điểm.
> Không đưa khóa API hoặc mật khẩu vào bài nộp.

## 2. Tính năng chính

1. **Form nhập**: tên sản phẩm, mô tả ngắn, đối tượng khách hàng, tông giọng (chọn 1 trong 3: Hài hước / Bắt trend, Trang trọng / Uy tín, Trẻ trung / Năng động). Kiểm tra dữ liệu trước khi gửi, báo lỗi ngay dưới từng ô.
2. **AI sinh nội dung**: 3 caption (3 góc: pain-point, lợi ích trực tiếp, review chân thực) + 3 headline + 5 hashtag theo đầu vào; đầu ra được kiểm tra đúng số lượng và kiểu dữ liệu.
3. **Copy và Tạo lại**: nút Copy cho từng caption, headline, hashtag (nút đổi thành “Đã sao chép!”); nút “Tạo lại” sinh bộ mới từ cùng đầu vào.
4. **Lịch sử (localStorage)**: tự lưu mỗi lần tạo, xem lại, xóa từng mục, xóa tất cả (tối đa 30 mục).
5. **Bộ đếm ký tự**: thanh đếm thời gian thực cho từng caption. **Ngưỡng do đội quy định:** trên 280 ký tự → cảnh báo vàng (không vừa X/Twitter, hook ngắn); trên 2.200 ký tự (giới hạn Instagram/Facebook) → cảnh báo đỏ “Vượt giới hạn”.

**Tính năng mở rộng ngoài đề bài:**

- **Chủ đề giao diện động**: màu toàn trang, ánh sáng nền và biểu tượng emoji bay đổi theo ngành hàng (ẩm thực, thời trang, làm đẹp, công nghệ…); có thể chọn màu thủ công hoặc để Tự động.
- **Viral Hook Generator**: 4 chiến lược (câu hỏi gây sốc, đòn bẩy con số, bóc trần sự thật, FOMO khẩn cấp) → 5 hook, chèn vào đầu caption bằng một nút.
- **Gia vị cảm xúc (Vibe-Tone)**: 4 gia vị (Gen Z, FOMO, Tâm sự, Tò mò) + thanh trượt Ít → Nhiều; kéo thanh trượt thì caption biến đổi sắc thái ngay.
- **Tùy chỉnh độ dài** (Ngắn gọn / Tiêu chuẩn / Chi tiết) và **CTA gợi ý theo ngành hàng** gắn vào cuối caption.
- **Xem trước đa nền tảng** (Facebook, Instagram, TikTok, Threads) với nút “Xem thêm”, caption “chạy chữ”, báo caption bị cắt ở đâu.
- **Đăng nhanh (bán tự động)**: Threads mở sẵn bài đã điền nội dung; Facebook/Instagram/TikTok copy rồi mở trang đăng; nút Chia sẻ dùng menu chia sẻ của thiết bị.
- **Lịch chiến dịch tuần**: tạo 3 bài cho Thứ 2 (giới thiệu), Thứ 4 (tương tác), Thứ 6 (chốt sale), thêm tay từng caption, xuất `.md` / `.json`.
- **Hashtag có điểm “độ hot” ước tính** và gợi ý hashtag ngách.
- Chỉnh sửa caption trực tiếp (bộ đếm cập nhật theo), xuất Markdown/TXT, nút “Thử nhanh” với 3 sản phẩm mẫu, phím tắt Ctrl + Enter, tự chuyển giao diện sáng/tối, tự tắt hiệu ứng khi hệ thống bật “giảm chuyển động”.

## 3. Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Giao diện | HTML/CSS/JS thuần, không dùng Tailwind |
| Thư viện | Lucide Icons 0.469.0 (CDN, không bắt buộc); font Plus Jakarta Sans (Google Fonts) |
| Máy chủ | 1 serverless function Node.js ≥ 18 (`api/generate.js`) làm proxy gọi AI; `server.js` để chạy local |
| Lưu trữ | localStorage (lịch sử, lịch tuần, màu giao diện); máy chủ không lưu dữ liệu người dùng |
| Triển khai | `<Vercel | điền nơi đã triển khai>` |

## 4. Tích hợp AI

- **Chế độ đang dùng**: **API thật** — Google Gemini (AI Studio) qua `/api/generate`.
  - Model: `gemini-3.5-flash` (cấu hình bằng `AI_MODEL`)
  - Khi AI không dùng được (chưa có khóa, lỗi mạng, quá tải 503, quá thời gian chờ, trả sai định dạng) giao diện chuyển sang **nội dung mẫu** và hiển thị rõ dòng *“Chưa kết nối được AI, đang hiển thị nội dung mẫu”*; lịch sử ghi nhãn “Mô phỏng” cho các lần đó, không gọi là AI thật.
- **Mục đích**: sinh caption, headline, hashtag và hook theo ngữ cảnh người dùng nhập (sản phẩm, đối tượng, tông giọng, gia vị cảm xúc, độ dài).
- **Kiểm soát đầu ra**: prompt yêu cầu JSON cố định, coi dữ liệu người dùng là dữ liệu (chống chèn chỉ thị), cấm bịa giá/số liệu/lời khách hàng; máy chủ chuẩn hóa các dạng JSON khác nhau, kiểm tra đúng 3 caption + 3 headline + 5 hashtag (hook: 5 câu), thiếu thì từ chối và dùng nội dung mẫu; hashtag được chuẩn hóa (thêm `#`, bỏ khoảng trắng).
- **Độ bền**: model quá tải/đổi tên thì tự thử model dự phòng (tối đa 3 model, tổng 19 giây); giảm bước “suy nghĩ” của model để trả lời nhanh hơn; giới hạn 20 lượt/phút/IP.
- **Chẩn đoán**: mở `/api/generate` (xem đã cấu hình chưa), `/api/generate?test=1` (gọi thử), `?test=gen` (chạy đúng prompt thật), `?test=all` (thử nhiều model) — không lộ khóa.
- **Bảo mật khoá API**: khóa chỉ nằm trong biến môi trường phía máy chủ (`.env`, không commit), không có trong mã phía trình duyệt.

Biến môi trường:

```env
AI_PROVIDER=gemini
AI_API_KEY=<khoá của bạn>
AI_MODEL=<tên model>
```

## 5. Cài đặt và chạy local

Yêu cầu: trình duyệt hiện đại; Node.js ≥ 18.

1. Giải nén file ZIP.
2. Sao chép `.env.example` thành `.env`, điền `AI_API_KEY` (và `AI_PROVIDER`, `AI_MODEL`).
3. Chạy `node server.js`, mở http://localhost:3000 (hoặc `vercel dev`).
4. Kiểm thử logic: `node test.js`.

> Không mở trực tiếp `index.html` bằng file hoặc Live Server: khi đó không có `/api/generate` nên chỉ ra nội dung mẫu.

## 6. Cấu trúc thư mục

```text
adgenie/
├── index.html
├── style.css
├── app.js          # form, kết quả, lịch sử, bộ đếm, copy
├── features.js     # Viral Hook, xem trước/đăng nhanh, lịch tuần, CTA, xuất file
├── fx.js           # chủ đề động, hiệu ứng chuyển động
├── logic.js        # kiểm tra đầu vào/đầu ra, nội dung mẫu, prompt (dùng chung trình duyệt, máy chủ, test)
├── api/generate.js # serverless proxy gọi AI
├── server.js       # chạy local
├── test.js         # kiểm thử tự động phần logic
├── assets/         # biểu tượng nền Facebook, Instagram, Threads, YouTube
├── package.json
├── .env.example    # mẫu biến môi trường
└── README.md
```

## 7. Truy cập và phân quyền

- Không yêu cầu đăng nhập.
- Không có màn hình quản trị riêng; người dùng tự xem, xóa lịch sử và lịch tuần ngay trên giao diện.

## 8. Giới hạn hiện tại

- Dữ liệu chỉ lưu trên trình duyệt hiện tại; xóa dữ liệu trình duyệt hoặc đổi thiết bị sẽ mất lịch sử và lịch tuần.
- API proxy chưa có xác thực, chỉ giới hạn 20 lượt/phút/IP.
- Gói miễn phí của Gemini có hạn mức và đôi khi quá tải (503); lúc đó giao diện chuyển sang nội dung mẫu và báo rõ.
- **Điểm “độ hot” hashtag là chỉ số ước tính bằng thuật toán nội bộ**, không phải dữ liệu thời gian thực về lượt dùng/tìm kiếm.
- **Đăng bài chưa tự động hoàn toàn**: đăng thẳng lên tài khoản cần OAuth và duyệt ứng dụng với Meta/TikTok; bản hiện tại dùng Threads intent, copy-và-mở trang đăng, Web Share.
- Số ký tự hiển thị trước “Xem thêm” (Facebook 140, Instagram 125, TikTok 100) là ước lượng của đội, có thể khác theo thiết bị.
- Nội dung mẫu (khi AI không dùng được) là mẫu ghép, không phải kết quả AI.

## 9. Nguồn tham khảo

- Google Fonts (Plus Jakarta Sans), Lucide Icons 0.469.0
- Tài liệu Google Gemini API (AI Studio)
- Biểu tượng Facebook, Instagram, Threads, YouTube chỉ dùng làm hình nền trang trí đã làm mờ; thuộc quyền của chủ sở hữu thương hiệu
- Tài liệu đề bài và tiêu chí của Ban tổ chức

## 10. Minh chứng dùng AI để xây dựng sản phẩm

Tối đa 1 trang kèm tối đa 5 ảnh/đoạn hội thoại chọn lọc. Ghi mục tiêu → yêu cầu cho AI → vấn đề phát hiện khi thử → yêu cầu sửa → kết quả kiểm tra lại.

- Tệp minh chứng: `<tên tệp ảnh/PDF kèm theo>`

| Vòng | Mục tiêu / yêu cầu cho AI | Vấn đề phát hiện khi thử | Yêu cầu sửa | Kết quả kiểm tra lại |
|---|---|---|---|---|
| 1 | Tích hợp API AI vào sản phẩm | Gọi thử báo “Nhà cung cấp AI trả lỗi 404” (tên model không còn tồn tại) | Tự dò model còn dùng được, hiển thị thông điệp gốc, thêm trang `?test=1` để chẩn đoán | `?test=1` trả `ok: true` |
| 2 | Khắc phục AI treo 30 giây | `?test=1` báo quá thời gian; thêm `?test=all` thì thấy model mới nhất trả 503 (quá tải), model cũ hơn chạy được | Tự chuyển model dự phòng, ưu tiên bản ổn định, gọi song song khi chậm, giảm bước “suy nghĩ” | `?test=1`: `ok: true`, 1,98 giây |
| 3 | Tạo caption thật bằng AI | Lần tạo thật vẫn dùng nội dung mẫu; `?test=gen` cho thấy AI trả hợp lệ nhưng mất 10,7 giây | Nới thời gian chờ, giảm mức suy nghĩ, chấp nhận nhiều dạng JSON | Tab Network: `generate` trả 200, 7,40 giây; lịch sử ghi “AI thật” |
| 4 | Ẩn dòng báo lỗi khi AI hoạt động | Dòng “Chưa kết nối được AI” hiện cả khi AI chạy thật | AI xác định lỗi do CSS `display` ghi đè thuộc tính `hidden`; thêm `[hidden]{display:none!important}` | Dòng báo chỉ còn hiện khi AI lỗi |

## 11. Bảng kiểm thử

TC01–TC18 chạy tự động bằng `node test.js` (18/18 đạt). TC19–TC20 ghi từ lần thử thực tế trên giao diện. TC21–TC22 cần đội thử thủ công rồi điền.

| Mã ca | Loại ca | Dữ liệu và bước thử | Kỳ vọng | Kết quả thực tế | Đạt/Chưa đạt |
|---|---|---|---|---|---|
| TC01 | Bình thường | Cà phê rang xay, tông trẻ trung | Ra đúng 3 caption, 3 headline, 5 hashtag | Ra đủ 3/3/5 | Đạt |
| TC02 | Bình thường | Lần lượt 3 tông giọng, rồi Tạo lại | Caption chứa tên SP; bộ mới khác bộ cũ | Đúng cả 3 tông, bộ mới khác | Đạt |
| TC03 | Không hợp lệ | Để trống tên sản phẩm | Chặn, báo lỗi dưới ô nhập | Bị chặn | Đạt |
| TC04 | Không hợp lệ | Gửi tông giọng ngoài 3 mức | Bị từ chối | Bị từ chối | Đạt |
| TC05 | Biên | Mô tả đúng 500 ký tự và 501 ký tự | 500 hợp lệ; 501 bị chặn | Đúng như kỳ vọng | Đạt |
| TC06 | Biên | Caption 280, 281, 2200, 2201 ký tự | ≤280 bình thường; 281–2200 cảnh báo vàng; >2200 cảnh báo đỏ | Đúng như kỳ vọng | Đạt |
| TC07 | Sự cố | AI trả thiếu caption / sai kiểu / không phải JSON | Bị từ chối, giao diện dùng nội dung mẫu | Bị từ chối (hàm kiểm soát) | Đạt |
| TC08 | Sự cố | AI trả hashtag thiếu `#` hoặc có khoảng trắng | Được chuẩn hóa | Chuẩn hóa đúng | Đạt |
| TC09 | Bình thường | Gia vị FOMO mức Tắt rồi mức Đậm; nhập gia vị/mức sai | Mức Tắt giữ nguyên; Đậm khác rõ; giá trị sai bị chuẩn hóa | Đúng như kỳ vọng | Đạt |
| TC10 | Bình thường | Tạo 5 hook cho từng chiến lược; AI trả thiếu hook | Đủ 5 hook chứa tên SP/đối tượng; thiếu thì bị từ chối | Đúng như kỳ vọng | Đạt |
| TC11 | Bình thường | Nhập “Váy hoa nhí”, “Cà phê”, để trống | Màu 335, 28, về 265 (tím mặc định) | Đúng như kỳ vọng | Đạt |
| TC12 | Biên | Chấm điểm hashtag; gợi ý ngách trùng hashtag chính | Điểm trong 1–99; không trùng | Đúng như kỳ vọng | Đạt |
| TC13 | Biên | Xem trước caption dài (Facebook), ngắn (Instagram), 501 ký tự (Threads) | Cắt tại “Xem thêm”; ngắn hiện đủ; Threads cảnh báo vượt | Đúng như kỳ vọng | Đạt |
| TC14 | Bình thường | Xuất lịch Markdown | Có tiêu đề từng ngày | Đúng như kỳ vọng | Đạt |
| TC15 | Biên | Độ dài Ngắn / Tiêu chuẩn / Chi tiết; độ dài sai | Ngắn < Tiêu chuẩn < Chi tiết; sai về Tiêu chuẩn | Đúng như kỳ vọng | Đạt |
| TC16 | Bình thường | Tạo 3 caption | 3 caption khác nhau theo 3 góc, đều chứa tên SP | Đúng như kỳ vọng | Đạt |
| TC17 | Bình thường | CTA cho “Serum Vitamin C”; từ khóa lạ | Ngành làm đẹp có “Đăng ký tư vấn da miễn phí”; lạ → bộ chung | Đúng như kỳ vọng | Đạt |
| TC18 | Bình thường | Xuất Markdown và TXT | `.md` có tiêu đề `##`; `.txt` không có ký hiệu | Đúng như kỳ vọng | Đạt |
| TC19 | Bình thường | Nhập sản phẩm trên giao diện, bấm Tạo Caption với AI thật (Gemini) | Ra nội dung do AI sinh, dòng báo lỗi không hiện, lịch sử ghi “AI thật” | Yêu cầu `generate` trả 200 trong 7,40 giây; lịch sử ghi “AI thật” | Đạt |
| TC20 | Sự cố | AI quá tải: nhà cung cấp trả 503 và quá thời gian chờ | Không treo; báo rõ; vẫn có nội dung mẫu | Log máy chủ ghi 503/timeout; giao diện hiện nội dung mẫu kèm dòng báo | Đạt |
| TC21 | Sự cố | Mở bằng `file://` hoặc tắt mạng, bấm Tạo Caption | Vẫn ra nội dung mẫu kèm dòng báo | `<Điền sau khi thử>` | `<Điền>` |
| TC22 | Không hợp lệ | Nhập tên `<img src=x onerror=alert(1)>` | Hiện nguyên văn, không chạy mã | `<Điền sau khi thử>` | `<Điền>` |

## 12. Hồ sơ bàn giao

- Source ZIP chứa mã nguồn và README này; chỉ kèm `.env.example`, không có khóa thật.
- Video tối đa 2 phút thể hiện thao tác thực tế và đủ 5 tính năng.
- Minh chứng dùng AI và bảng kiểm thử nằm trong README này (mục 10, 11) và `<tệp ảnh kèm theo>`.
- Không cần tài khoản; dữ liệu demo: dùng nút “Thử nhanh” (3 sản phẩm mẫu: cà phê, váy hoa, bún bò).
- Bản nộp trước hạn là căn cứ chấm; không sửa tính năng sau hạn nộp.
