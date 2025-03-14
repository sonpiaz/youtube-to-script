import React, { useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  currentTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  currentTime,
  onTimeUpdate 
}) => {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const previousVideoId = useRef<string>('');
  const timeUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Khởi tạo YouTube API
  useEffect(() => {
    // Tải YouTube iframe API nếu chưa được tải
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [videoId]);

  // Xử lý khi currentTime thay đổi (khi người dùng click vào timestamp)
  useEffect(() => {
    if (playerRef.current && currentTime !== undefined) {
      playerRef.current.seekTo(currentTime / 1000, true);
    }
  }, [currentTime]);

  const initializePlayer = () => {
    // Nếu player đã tồn tại và video id chưa thay đổi, không cần khởi tạo lại
    if (playerRef.current && previousVideoId.current === videoId) {
      return;
    }
    
    previousVideoId.current = videoId;
    
    // Xóa interval cũ nếu có
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }

    // Đợi YT API sẵn sàng
    if (window.YT && window.YT.Player && playerContainerRef.current) {
      // Xóa nội dung cũ trước khi tạo player mới
      if (playerContainerRef.current.firstChild) {
        playerContainerRef.current.innerHTML = '';
      }

      // Tạo element cho player
      const playerElement = document.createElement('div');
      playerContainerRef.current.appendChild(playerElement);

      // Khởi tạo player
      playerRef.current = new window.YT.Player(playerElement, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }
  };

  const onPlayerReady = () => {
    // Bắt đầu tracking thời gian hiện tại
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
    
    // Cập nhật thời gian hiện tại mỗi 100ms
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && onTimeUpdate) {
        const currentTime = playerRef.current.getCurrentTime() * 1000; // Convert to ms
        onTimeUpdate(currentTime);
      }
    }, 100);
  };

  const onPlayerStateChange = (event: any) => {
    // Có thể thêm xử lý khác tại đây
  };

  if (!videoId) return null;

  return (
    <div className="youtube-player" ref={playerContainerRef}></div>
  );
};

export default YouTubePlayer; 