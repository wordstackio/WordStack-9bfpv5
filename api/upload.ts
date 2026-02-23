import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    const filename = req.headers['x-filename'] || `upload-${Date.now()}`;

    // Stream the raw body directly to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({
      url: blob.url,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
