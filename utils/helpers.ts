/**
 * Trích xuất ID video từ URL YouTube
 * @param url URL YouTube
 * @returns ID video hoặc null nếu không tìm thấy
 */
export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

/**
 * Định dạng thời gian từ mili giây thành chuỗi MM:SS
 * @param ms Thời gian tính bằng mili giây
 * @returns Chuỗi thời gian định dạng MM:SS
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Chuyển đổi mảng văn bản thành văn bản có thể tải xuống
 * @param transcript Mảng các mục văn bản
 * @returns Văn bản đã định dạng với dấu thời gian
 */
export const transcriptToText = (transcript: any[]): string => {
  return transcript
    .map(item => `[${formatTime(item.offset)}] ${item.text}`)
    .join('\n');
};

/**
 * Tải xuống văn bản dưới dạng tệp
 * @param content Nội dung văn bản
 * @param filename Tên tệp
 */
export const downloadTextFile = (content: string, filename: string): void => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Sao chép văn bản vào clipboard
 * @param text Văn bản cần sao chép
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Đã sao chép văn bản vào clipboard!');
  } catch (err) {
    console.error('Không thể sao chép văn bản:', err);
    alert('Không thể sao chép văn bản. Vui lòng thử lại.');
  }
}; 