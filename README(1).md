# Trình tạo caption quảng cáo bằng AI — Cuộc thi Vibe Coding 2026

> Các mục dạng `<...>` là thông tin đội cần điền trước khi nộp.

## 1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Tên đội thi | `F1-score` |
| Bảng thi | Bảng A - Công nghệ |
| Đề bài bốc thăm | Đề số 2 — Trình tạo caption quảng cáo bằng AI |
| Demo online | `không có` |
| Video demo (≤ 02 phút) | `https://drive.google.com/file/d/1H502eB-pVCe_qXYcVJVlZ5BiYaFPkNtm/view?usp=sharing` |
| Source ZIP | `https://github.com/ngbhan281207-del/ADGENIE-2026.git` |
| Minh chứng dùng AI | `https://docs.google.com/document/d/1UEubQfocP62NCDA5AdEZn5suU_a65m-6ZizHSo92WD8/edit?usp=sharing` |
| Bảng kiểm thử | Mục 11 của README này |

## 2. Tính năng chính

1. Form nhập: tên sản phẩm, mô tả ngắn, đối tượng khách hàng, tông giọng (chọn 1 trong 3: Hài hước / Bắt trend, Trang trọng / Uy tín, Trẻ trung / Năng động). Kiểm tra dữ liệu trước khi gửi.
2. AI sinh 3 caption + 3 headline + 5 hashtag theo đầu vào; đầu ra được kiểm tra đúng số lượng và kiểu dữ liệu.
3. Nút Copy cho từng caption, headline, hashtag (và Copy tất cả hashtag); nút “Tạo lại” sinh bộ mới.
4. Lịch sử lưu localStorage: xem lại, xóa từng mục, xóa tất cả (tối đa 30 mục).
5. Bộ đếm ký tự cho từng caption kèm thanh đo. Ngưỡng do đội quy định: trên 280 ký tự → cảnh báo vàng (không vừa X/Twitter, hook ngắn); trên 2.200 ký tự (giới hạn Instagram/Facebook) → cảnh báo đỏ “Vượt giới hạn”.

Tính năng mở rộng ngoài đề bài:

- Chủ đề giao diện động: màu toàn trang, hiệu ứng ánh sáng nền (aurora) và các biểu tượng emoji bay theo ngành hàng (ẩm thực, thời trang, làm đẹp, công nghệ…); có thể chọn màu thủ công hoặc để Tự động.
- Hiệu ứng chuyển động: các khối xuất hiện lần lượt, caption “chạy chữ” trong khung xem trước, confetti khi tạo xong, ripple trên nút, parallax nhẹ theo chuột. Tự tắt khi hệ thống bật “giảm chuyển động”.

- 3 caption theo 3 góc tiếp cận (pain-point, lợi ích trực tiếp, review chân thực), mỗi caption có nhãn góc.
- Tùy chỉnh độ dài** (Ngắn gọn / Tiêu chuẩn / Chi tiết) và kéo thanh trượt gia vị cảm xúc, caption tự biến đổi sắc thái ngay (không tạo thêm mục lịch sử).
- CTA gợi ý theo ngành hàng (mua ngay, nhận ưu đãi, đăng ký tư vấn…) gắn vào cuối caption bằng một nút.
- Xuất nội dung ra Markdown hoặc TXT; nút Copy đổi thành “Đã sao chép!”.
- Tự chuyển giao diện sáng/tối theo hệ thống.

- Giao diện đổi màu theo ngành hàng (dynamic theming): đổi tông màu toàn trang theo tên/mô tả sản phẩm (đồ ăn, thời trang, mỹ phẩm, công nghệ, sức khỏe…), có hiệu ứng chuyển màu mượt.
- Gia vị cảm xúc (Vibe-Tone Customizer): 4 gia vị (Gen Z, FOMO, Tâm sự, Tò mò) + thanh trượt Ít → Nhiều (Tắt/Nhẹ/Vừa/Đậm) cộng thêm vào 3 tông giọng cố định.
- Viral Hook Generator: 4 chiến lược (câu hỏi gây sốc, đòn bẩy con số, bóc trần sự thật, FOMO khẩn cấp) → 5 hook, chèn vào đầu caption bằng một nút.
- Hashtag có điểm “độ hot” ước tính và gợi ý 4 hashtag ngách theo sản phẩm.
- Xem trước đa nền tảng: Facebook, Instagram, TikTok, Threads với nút “Xem thêm”, báo caption bị cắt ở đâu và cảnh báo vượt giới hạn.
- Đăng nhanh (bán tự động): Threads mở sẵn bài với nội dung đã điền; Facebook/Instagram/TikTok copy rồi mở trang đăng; nút Chia sẻ dùng menu chia sẻ của thiết bị.
- Lịch chiến dịch tuần: “Tạo chiến dịch tuần” sinh sẵn 3 bài (Thứ 2 giới thiệu, Thứ 4 tương tác, Thứ 6 chốt sale), thêm tay từng caption, xuất `.md`/`.json`.
- Prompt caption nâng cấp: 3 góc tiếp cận khác nhau, hook dòng đầu, lợi ích cụ thể, lời kêu gọi rõ, cấm bịa giá/số liệu.

- Nút “Thử nhanh” điền sẵn 3 sản phẩm mẫu để dùng thử ngay.
- Chỉnh sửa caption trực tiếp; bộ đếm, thanh đo và nhãn Instagram ✓/✗, Facebook ✓ cập nhật theo thời gian thực.
- “Copy cả bài + hashtag” (caption kèm 5 hashtag) và “Copy tất cả hashtag”.
- Công tắc Mock AI / Live API (Live lỗi thì tự chuyển sang Mock); phím tắt Ctrl + Enter, hiệu ứng chờ khi đang tạo, tự động chuyển giao diện sáng/tối.

## 3. Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Giao diện | HTML/CSS/JS thuần (CSS `@property` để chuyển màu mượt) (giao diện kính mờ tông tím), không dùng Tailwind |
| Thư viện | Lucide Icons 0.469.0 (CDN, không bắt buộc); font Plus Jakarta Sans (Google Fonts) |
| Backend | 1 serverless function `api/generate.js` (Node ≥ 18) làm proxy gọi AI |
| Lưu trữ | localStorage (phía trình duyệt) |
| Triển khai | Vercel |

## 4. Tích hợp AI

- Chế độ: API thật qua `/api/generate` (serverless, hỗ trợ Google Gemini hoặc API tương thích OpenAI). Nếu AI không kết nối được (chưa có khóa, lỗi mạng, quá 20 giây, trả sai định dạng) thì giao diện tự dùng nội dung mẫu và hiển thị rõ dòng “Chưa kết nối được AI, đang hiển thị nội dung mẫu”; lịch sử ghi nhãn “Mô phỏng” cho các lần đó.
  - Nhà cung cấp / model: `<gemini | openai>` / `<tên model>`
- Bảo vệ API: kiểm tra đầu vào ở server, giới hạn 20 lượt/phút/IP, hết thời gian chờ 20 giây; mở `/api/generate` bằng trình duyệt để xem đã cấu hình chưa (không lộ khóa).
- Kiểm soát đầu ra: prompt yêu cầu JSON cố định, coi dữ liệu người dùng là dữ liệu (chống chèn chỉ thị); `normalizeOutput()` từ chối kết quả thiếu/sai kiểu, tự chuẩn hóa hashtag (thêm `#`, bỏ khoảng trắng); server kiểm tra lại đầu vào trước khi gọi AI.
- Bảo mật khóa API: khóa chỉ nằm ở biến môi trường server, không có trong mã client.

```env
AI_PROVIDER=gemini
AI_API_KEY=<khóa của bạn>
AI_MODEL=<tên model, để trống dùng mặc định>
```

## 5. Cài đặt và chạy local

Chạy giao diện (chế độ Mock): giải nén ZIP, mở `index.html` hoặc `npx serve .`

Chạy cả AI thật: sao chép `.env.example` thành `.env`, điền khóa, rồi `node server.js` và mở http://localhost:3000 (hoặc `vercel dev`).

Kiểm thử logic: `node test.js`

## 6. Cấu trúc thư mục

```text
caption-ai/
├── index.html      # giao diện
├── style.css
├── assets/         # biểu tượng nền (Facebook, Instagram, Threads, YouTube)
├── app.js          # xử lý giao diện, lịch sử, copy, gọi API
├── fx.js           # chủ đề động, hạt emoji, confetti, ripple, parallax
├── features.js     # Viral Hook, xem trước/đăng nhanh, lịch tuần
├── logic.js        # kiểm tra đầu vào, kiểm soát đầu ra, Mock, bộ đếm (dùng chung client/server/test)
├── api/generate.js # serverless proxy gọi AI
├── server.js       # chạy local (static + /api/generate)
├── package.json
├── test.js         # kiểm thử tự động phần logic
├── .env.example
└── README.md
```

## 7. Truy cập và phân quyền

Không yêu cầu đăng nhập; không có màn hình quản trị. Lịch sử do người dùng tự xem/xóa ngay trên giao diện.

## 8. Giới hạn hiện tại

- Dữ liệu chỉ lưu trên trình duyệt hiện tại; xóa dữ liệu trình duyệt hoặc đổi thiết bị sẽ mất lịch sử.
- Chưa có xác thực và giới hạn số lần gọi (rate limit) cho API proxy.
- Điểm “độ hot” hashtag là chỉ số ước tính bằng thuật toán nội bộ, không phải dữ liệu thời gian thực về lượt dùng/tìm kiếm (các nền tảng không mở API này miễn phí).
- Đăng bài chưa phải tự động hoàn toàn: gửi thẳng lên tài khoản cần đăng nhập OAuth và duyệt ứng dụng với Meta/TikTok; bản hiện tại dùng Threads intent, copy-và-mở trang đăng, và Web Share.
- Số ký tự hiển thị trước “Xem thêm” (Facebook 140, Instagram 125, TikTok 100) là ước lượng của đội và có thể khác theo thiết bị.
- Ở chế độ Mock, nội dung là mẫu ghép, không phải kết quả AI thật.
- Ngưỡng 500 ký tự là quy ước của đội, không phải quy định chính thức của Facebook/Instagram.

## 9. Nguồn tham khảo

- Google Fonts (Plus Jakarta Sans), Lucide Icons
- Tài liệu đề bài và tiêu chí của Ban tổ chức

## 10. Minh chứng dùng AI để xây dựng sản phẩm

`<Tối đa 1 trang + tối đa 5 ảnh/hội thoại. Ghi: mục tiêu → yêu cầu cho AI → vấn đề phát hiện khi thử → yêu cầu sửa → kết quả kiểm tra lại.>`

## 11. Bảng kiểm thử

TC01–TC18 chạy bằng `node test.js` (kết quả thực tế bên dưới). TC20–TC21 cần đội thử thủ công trên giao diện rồi điền.

| Mã ca | Loại ca | Dữ liệu và bước thử | Kỳ vọng | Kết quả thực tế | Đạt/Chưa đạt |
|---|---|---|---|---|---|
| TC01 | Bình thường | Cà phê rang xay, tông trẻ trung | Ra đúng 3 caption, 3 headline, 5 hashtag | Ra đủ 3/3/5 | Đạt |
| TC02 | Bình thường | Lần lượt 3 tông giọng, rồi Tạo lại | Caption chứa tên SP; bộ mới khác bộ cũ | Đúng cả 3 tông, bộ mới khác | Đạt |
| TC03 | Không hợp lệ | Để trống tên sản phẩm | Chặn, báo lỗi dưới ô nhập | Bị chặn | Đạt |
| TC04 | Không hợp lệ | Gửi tông giọng ngoài 3 mức | Bị từ chối | Bị từ chối | Đạt |
| TC05 | Biên | Mô tả đúng 500 ký tự và 501 ký tự | 500 hợp lệ; 501 bị chặn | Đúng như kỳ vọng | Đạt |
| TC06 | Biên | Caption 280, 281, 2200, 2201 ký tự | ≤280 bình thường; 281–2200 cảnh báo vàng; >2200 cảnh báo đỏ | Đúng như kỳ vọng | Đạt |
| TC07 | Sự cố | AI trả thiếu caption / sai kiểu / không phải JSON | Bị từ chối, giao diện dùng Mock | Bị từ chối (hàm kiểm soát) | Đạt |
| TC08 | Sự cố | AI trả hashtag thiếu `#` hoặc có khoảng trắng | Được chuẩn hóa | Chuẩn hóa đúng | Đạt |
| TC09 | Bình thường | Gia vị FOMO mức Tắt rồi mức Đậm; nhập gia vị/mức sai | Mức Tắt giữ nguyên; Đậm khác rõ; giá trị sai bị chuẩn hóa | Đúng như kỳ vọng | Đạt |
| TC10 | Bình thường | Tạo 5 hook cho từng chiến lược; AI trả thiếu hook | Đủ 5 hook chứa tên SP/đối tượng; thiếu thì bị từ chối | Đúng như kỳ vọng | Đạt |
| TC11 | Bình thường | Nhập “Váy hoa nhí”, “Cà phê”, để trống | Tông 335, 28, về 265 (tím mặc định) | Đúng như kỳ vọng | Đạt |
| TC12 | Biên | Chấm điểm hashtag; gợi ý ngách trùng hashtag chính | Điểm trong 1–99; không trùng | Đúng như kỳ vọng | Đạt |
| TC13 | Biên | Xem trước caption dài trên Facebook, ngắn trên Instagram, 501 ký tự trên Threads | Cắt tại “Xem thêm”; ngắn hiện đủ; Threads cảnh báo vượt | Đúng như kỳ vọng | Đạt |
| TC14 | Bình thường | Xuất lịch Markdown | Có tiêu đề từng ngày | Đúng như kỳ vọng | Đạt |
| TC15 | Biên | Độ dài Ngắn / Tiêu chuẩn / Chi tiết; độ dài sai | Ngắn < Tiêu chuẩn < Chi tiết; sai về Tiêu chuẩn | Đúng như kỳ vọng | Đạt |
| TC16 | Bình thường | Tạo 3 caption | 3 caption khác nhau theo 3 góc, đều chứa tên SP | Đúng như kỳ vọng | Đạt |
| TC17 | Bình thường | CTA cho “Serum Vitamin C”; từ khóa lạ | Ngành làm đẹp có “Đăng ký tư vấn da miễn phí”; lạ → bộ chung | Đúng như kỳ vọng | Đạt |
| TC18 | Bình thường | Xuất Markdown và TXT | .md có tiêu đề `##`; .txt không có ký hiệu | Đúng như kỳ vọng | Đạt |

## 12. Hồ sơ bàn giao

- Source ZIP chứa mã nguồn và README này; chỉ kèm `.env.example`, không có khóa thật.
- Video tối đa 2 phút, thao tác thực tế đủ 5 tính năng.
- Minh chứng dùng AI nằm trong ZIP hoặc có liên kết riêng.
- Không sửa tính năng sau hạn nộp.
