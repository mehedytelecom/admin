const BOT_TOKEN = '8767887962:AAF4ex27dfGPcYbuL-K6ZyJi1b4e2w0K7IY';
const CHAT_ID = '-1003663543666';

export async function uploadImageToTelegram(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.ok) {
          const photo = data.result.photo;
          resolve(photo[photo.length - 1].file_id);
        } else {
          reject(new Error(data.description || 'Failed to upload to Telegram'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function getTelegramImageUrl(fileId: string): Promise<string> {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(data.description || 'Failed to get file path from Telegram');
  }

  const filePath = data.result.file_path;
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
}
