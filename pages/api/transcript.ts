import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';

interface ResponseData {
  transcript?: any[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }

  try {
    const { videoId } = req.body;

    // Kiểm tra xem videoId có tồn tại không
    if (!videoId) {
      return res.status(400).json({ error: 'Thiếu ID video' });
    }

    // Lấy văn bản từ video YouTube
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Kiểm tra xem có văn bản không
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy văn bản cho video này' });
    }

    // Trả về văn bản
    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('Lỗi khi lấy văn bản:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy văn bản' });
  }
} 