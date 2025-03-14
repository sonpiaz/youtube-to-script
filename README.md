# YouTube Transcript Generator

## Tổng quan dự án

YouTube Transcript Generator là một ứng dụng web cho phép người dùng trích xuất, xem và tải xuống phụ đề (transcript) từ các video YouTube một cách nhanh chóng và dễ dàng. Ứng dụng hỗ trợ tự động cuộn theo nội dung đang phát, đồng bộ hóa với video, và các tính năng tiện ích khác.

## Tính năng hiện có

- ✅ Trích xuất transcript từ bất kỳ video YouTube nào có sẵn phụ đề
- ✅ Phát video YouTube cùng với transcript đồng bộ
- ✅ Tự động cuộn transcript theo nội dung đang phát
- ✅ Nhấp vào timestamp để nhảy đến thời điểm cụ thể trong video
- ✅ Sao chép toàn bộ transcript vào clipboard
- ✅ Tải xuống transcript dưới dạng tệp văn bản (.txt)
- ✅ Giao diện người dùng thân thiện, phản hồi nhanh

## Tính năng sắp tới

### AI Transcript Summary

Chúng ta sẽ phát triển tính năng tóm tắt nội dung video bằng AI dựa trên transcript đã trích xuất:

- 🔮 **Tóm tắt tự động bằng AI**: Sử dụng các mô hình AI như OpenAI GPT hoặc Anthropic Claude để tạo ra bản tóm tắt ngắn gọn, dễ hiểu của video.
- 🔮 **Tùy chỉnh độ dài tóm tắt**: Cho phép người dùng chọn độ dài tóm tắt (ngắn, vừa, dài).
- 🔮 **Trích xuất điểm chính**: Xác định và liệt kê các điểm chính trong video.
- 🔮 **Hỗ trợ đa ngôn ngữ**: Tóm tắt có thể được dịch sang nhiều ngôn ngữ khác nhau.

### Mô hình kinh doanh

- **Miễn phí**: 
  - Trích xuất transcript không giới hạn
  - Tóm tắt cơ bản với GPT-3.5 hoặc Claude Instant (giới hạn 5 tóm tắt/ngày)
  - Không yêu cầu đăng nhập

- **Premium** (dự kiến):
  - Tóm tắt nâng cao với GPT-4 hoặc Claude 3 Opus
  - Không giới hạn số lượng tóm tắt
  - Tùy chỉnh định dạng tóm tắt (học thuật, kinh doanh, giải trí)
  - Xuất tóm tắt sang nhiều định dạng (PDF, DOCX, Markdown)
  - Lưu trữ lịch sử tóm tắt

## Tech Stack

### Hiện tại

- **Frontend**: Next.js + TypeScript + React
- **Styling**: CSS modules
- **Trích xuất Transcript**: YouTube Transcript API
- **Video Player**: Embedded YouTube iFrame
- **Deployment**: Vercel

### Đề xuất bổ sung cho tính năng AI Summary

- **AI Models**: 
  - OpenAI API (GPT-3.5/GPT-4) hoặc
  - Anthropic API (Claude)
  - Hoặc OpenRouter để kết nối với nhiều mô hình khác nhau

- **Backend Additions**:
  - Serverless Functions (Vercel/AWS Lambda) để xử lý cuộc gọi API đến các mô hình AI
  - Redis hoặc DynamoDB để lưu trữ cache và quản lý hạn ngạch sử dụng

- **Authentication** (cho phiên bản Premium):
  - NextAuth.js hoặc Clerk (dễ tích hợp với Next.js)
  - JWT để quản lý phiên đăng nhập

- **Payment Processing** (cho phiên bản Premium):
  - Stripe cho xử lý thanh toán
  - Subscriptions API để quản lý đăng ký

## Triển khai tính năng AI Summary

### Kiến trúc đề xuất

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│                 │    │                 │    │                  │
│  Next.js App    │───►│ Serverless API  │───►│  AI Model API    │
│                 │    │                 │    │                  │
└─────────────────┘    └─────────────────┘    └──────────────────┘
        ▲                      │                       │
        │                      ▼                       │
        │              ┌─────────────────┐            │
        └──────────────│    Database     │◄───────────┘
                       │  (Cache/Quota)  │
                       └─────────────────┘
```

### Triển khai API cơ bản

```typescript
// pages/api/summarize.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, length = 'medium' } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Định nghĩa độ dài tóm tắt
    const lengthMap = {
      short: "Tóm tắt ngắn gọn không quá 100 từ",
      medium: "Tóm tắt vừa phải khoảng 200 từ",
      long: "Tóm tắt chi tiết khoảng 400 từ"
    };
    
    // Gọi API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Bạn là một công cụ tóm tắt nội dung chuyên nghiệp. 
                    Nhiệm vụ của bạn là tạo ra một bản tóm tắt ${lengthMap[length]} 
                    từ transcript của video YouTube. 
                    Hãy nêu bật những ý chính và thông tin quan trọng nhất.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // Trả về kết quả
    return res.status(200).json({ 
      summary: completion.choices[0].message.content
    });
    
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    return res.status(500).json({ error: 'Failed to summarize transcript' });
  }
}
```

## Hướng dẫn cài đặt và sử dụng

1. Clone repository
```bash
git clone https://github.com/sonpiaz/youtube-to-script.git
cd youtube-to-script
```

2. Cài đặt dependencies
```bash
npm install
```

3. Tạo file .env.local và thêm các biến môi trường
```
YOUTUBE_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key (for future AI summary feature)
```

4. Chạy ứng dụng trong môi trường phát triển
```bash
npm run dev
```

5. Truy cập ứng dụng tại [http://localhost:3000](http://localhost:3000)

## Đóng góp

Chúng tôi luôn chào đón các đóng góp! Vui lòng tạo issue hoặc pull request để đóng góp vào dự án.

## Giấy phép

MIT License

---

Dự án này được phát triển bởi Son Piaz và đóng góp từ cộng đồng. 