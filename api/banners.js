// Vercel API endpoint for banner management
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const bannersPath = join(process.cwd(), 'public', 'banners.json');

  try {
    if (req.method === 'GET') {
      // Read banners
      try {
        const banners = JSON.parse(readFileSync(bannersPath, 'utf8'));
        return res.status(200).json(banners);
      } catch (error) {
        return res.status(200).json([]);
      }
    }

    if (req.method === 'POST') {
      // Update banners
      const banners = req.body;
      
      if (!Array.isArray(banners)) {
        return res.status(400).json({ error: 'Invalid banners data' });
      }

      // Write to file
      writeFileSync(bannersPath, JSON.stringify(banners, null, 2));
      
      return res.status(200).json({ 
        success: true, 
        message: `Updated ${banners.length} banners`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Banners API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}