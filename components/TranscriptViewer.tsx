import React, { useState, useEffect, useRef } from 'react';
import { formatTime, copyToClipboard, downloadTextFile } from '../utils/helpers';

interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

interface TranscriptViewerProps {
  transcript: TranscriptItem[];
  videoId: string;
  currentTime?: number;
  onTimestampClick?: (time: number) => void;
  autoScroll?: boolean;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ 
  transcript, 
  videoId, 
  currentTime = 0,
  onTimestampClick,
  autoScroll = true
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const transcriptItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Cập nhật transcript thì reset refs
  useEffect(() => {
    transcriptItemsRef.current = transcriptItemsRef.current.slice(0, transcript.length);
  }, [transcript]);

  // Tìm đoạn transcript đang được phát
  useEffect(() => {
    if (!transcript || transcript.length === 0 || currentTime === undefined) return;

    let foundIndex = -1;
    for (let i = 0; i < transcript.length; i++) {
      const item = transcript[i];
      const endTime = item.offset + item.duration;
      
      if (currentTime >= item.offset && currentTime < endTime) {
        foundIndex = i;
        break;
      }
    }
    
    // Nếu không tìm thấy đoạn nào phù hợp, thử tìm đoạn gần nhất
    if (foundIndex === -1) {
      for (let i = 0; i < transcript.length; i++) {
        // Nếu chưa đến thời điểm của đoạn đầu tiên
        if (currentTime < transcript[0].offset) {
          foundIndex = 0;
          break;
        }
        
        // Nếu đã qua thời điểm của đoạn cuối cùng
        if (i === transcript.length - 1) {
          foundIndex = i;
          break;
        }
        
        // Tìm đoạn gần nhất dựa trên thời gian
        const currentOffset = Math.abs(transcript[i].offset - currentTime);
        const nextOffset = Math.abs(transcript[i+1].offset - currentTime);
        
        if (currentOffset < nextOffset) {
          foundIndex = i;
          break;
        }
      }
    }

    setActiveIndex(foundIndex);
    
    // Xử lý tự động cuộn với logic đơn giản hơn
    if (autoScroll && foundIndex !== -1 && transcriptItemsRef.current[foundIndex] && transcriptContainerRef.current) {
      const itemElement = transcriptItemsRef.current[foundIndex];
      const containerElement = transcriptContainerRef.current;
      
      if (itemElement) {
        itemElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, transcript, autoScroll]);

  // Xử lý khi click vào timestamp
  const handleTimestampClick = (time: number) => {
    if (onTimestampClick) {
      onTimestampClick(time);
    }
  };

  const handleCopy = () => {
    const text = transcript
      .map(item => `[${formatTime(item.offset)}] ${item.text}`)
      .join('\n');
    copyToClipboard(text);
  };

  const handleDownload = () => {
    const text = transcript
      .map(item => `[${formatTime(item.offset)}] ${item.text}`)
      .join('\n');
    downloadTextFile(text, `transcript-${videoId}.txt`);
  };

  const toggleAutoScroll = () => {
    if (onTimestampClick) {
      onTimestampClick(-1); // -1 để chỉ cập nhật autoScroll mà không nhảy video
    }
  };

  if (!transcript || transcript.length === 0) return null;

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <h2>Văn bản đã trích xuất</h2>
        <div className="transcript-actions">
          <button onClick={toggleAutoScroll} className="btn btn-secondary">
            {autoScroll ? 'Tắt tự động cuộn' : 'Bật tự động cuộn'}
          </button>
          <button onClick={handleCopy} className="btn btn-secondary">
            Sao chép
          </button>
          <button onClick={handleDownload} className="btn btn-secondary">
            Tải xuống
          </button>
        </div>
      </div>
      <div className="transcript-content" ref={transcriptContainerRef}>
        {transcript.map((item, index) => {
          return (
            <div 
              key={index}
              className={`transcript-item ${activeIndex === index ? 'active' : ''}`}
              ref={el => transcriptItemsRef.current[index] = el}
            >
              <div className="transcript-timestamp" onClick={() => handleTimestampClick(item.offset)}>
                {formatTime(item.offset)}
              </div>
              <div className="transcript-text">{item.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptViewer; 