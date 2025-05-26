import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Phương thức không được phép' });
  }

  try {
    // Parse FormData từ request
    const form = formidable({
          maxFileSize: 20 * 1024 * 1024,
          keepExtensions: true,
          allowEmptyFiles: false,
          multiples: false // Chỉ cho phép upload 1 file
        });
    const token = req.cookies['authToken']
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      }
    );
    console.log("Fields received:", fields);
    console.log("Files received:", files);

    // Kiểm tra có file không
    if (!files.file) {
      return res.status(400).json({ message: 'Chưa tải lên tệp' });
    }

    // Xử lý files.file có thể là File hoặc File[]
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    // Đọc tệp vào Buffer
    const fileBuffer = await fs.readFile(file.filepath);

    // Parse phần request từ fields.request
    

    // Chuẩn bị FormData
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' }), file.originalFilename || 'file');
    
    // Thêm các trường khác từ form-body
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        if (key !== 'file') { // Tránh trùng lặp với file đã thêm
          if (Array.isArray(value)) {
            // Nếu là mảng, thêm từng giá trị
            value.forEach(item => {
              formData.append(key, item.toString());
            });
          }
        }
      });
    }

    // Gửi request đến backend Java
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${token|| ''}`,
        },
      }
    );

    // Xóa tệp tạm
    await fs.unlink(file.filepath);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Lỗi khi tải lên tệp:', error);  
    return res.status(500).json({
      message: 'Lỗi server nội bộ',
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
}