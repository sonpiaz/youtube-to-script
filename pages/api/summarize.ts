import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

type ResponseData = {
  summary?: string;
  error?: string;
};

type LengthOption = 'short' | 'medium' | 'long';

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
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
    const lengthMap: Record<LengthOption, string> = {
      short: "Tóm tắt ngắn gọn không quá 100 từ",
      medium: "Tóm tắt vừa phải khoảng 200 từ",
      long: "Tóm tắt chi tiết khoảng 400 từ"
    };
    
    const summaryLength = lengthMap[length as LengthOption] || lengthMap.medium;
    
    // Gọi API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Bạn là một công cụ tóm tắt nội dung chuyên nghiệp. 
                    Nhiệm vụ của bạn là tạo ra một bản tóm tắt ${summaryLength} 
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