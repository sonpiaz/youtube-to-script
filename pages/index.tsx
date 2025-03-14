import React, { useState, FormEvent, useRef } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import YouTubePlayer from '../components/YouTubePlayer';
import TranscriptViewer from '../components/TranscriptViewer';
import { extractVideoId } from '../utils/helpers';

const Home: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Thêm state cho các tính năng mới
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number | undefined>(undefined);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Trích xuất ID video từ URL
    const id = extractVideoId(url);
    if (!id) {
      setError('URL YouTube không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setVideoId(id);
    setIsLoading(true);
    // Reset các state
    setCurrentTime(0);
    setSelectedTime(undefined);

    try {
      // Gọi API để lấy văn bản
      const response = await axios.post('/api/transcript', { videoId: id });
      setTranscript(response.data.transcript);
    } catch (err: any) {
      console.error('Lỗi:', err);
      setError(
        err.response?.data?.error || 
        'Đã xảy ra lỗi khi lấy văn bản. Vui lòng thử lại sau.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi player cập nhật thời gian
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Xử lý khi người dùng click vào timestamp
  const handleTimestampClick = (time: number) => {
    // Nếu time là -1, chỉ toggle autoScroll
    if (time === -1) {
      setAutoScroll(!autoScroll);
      return;
    }
    
    setSelectedTime(time);
  };

  return (
    <div className="container">
      <Header />
      
      <main className="main">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="youtube-url">URL Video YouTube</label>
              <input
                type="text"
                id="youtube-url"
                className="form-control"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Lấy văn bản'}
            </button>
          </form>
        </div>

        {error && <div className="error">{error}</div>}

        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        )}

        {videoId && (
          <YouTubePlayer 
            videoId={videoId} 
            currentTime={selectedTime} 
            onTimeUpdate={handleTimeUpdate} 
          />
        )}

        {transcript.length > 0 && (
          <TranscriptViewer 
            transcript={transcript} 
            videoId={videoId}
            currentTime={currentTime}
            onTimestampClick={handleTimestampClick}
            autoScroll={autoScroll}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home; 