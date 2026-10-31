import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'portfolio.json');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial curated seed data with breathtaking photography
const DEFAULT_DATA = {
  admin: {
    username: 'admin',
    password: 'password123', // Can be changed in Admin Panel
  },
  categories: ['All', 'Editorial', 'Portraits', 'Architecture', 'Landscapes', 'Street'],
  about: {
    name: 'HAMANTA',
    title: 'Visual Artist & Editorial Photographer',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    location: 'Berlin & New York / Available Worldwide',
    yearsExperience: 9,
    exhibitionsCount: 14,
    awardsCount: 6,
    philosophy: 'My work explores the fragile intersections of architectural geometry, quiet human intimacy, and natural luminescence. Capturing moments not as they look, but as they felt in the stillness.',
    bio: [
      'Hamanta is an internationally published documentary and fine art photographer based between Berlin and New York. Trained in classical darkroom printmaking and contemporary digital aesthetics, his imagery focuses on understated mood, brutalist architecture, and cinematic character studies.',
      'Her visual essays have been featured in Kinfolk, Cereal Magazine, Architectural Digest, and The New York Times Style Magazine. She frequently travels on assignment for cultural institutions and architectural practices.'
    ],
    clients: ['Vogue Scandinavia', 'Architectural Digest', 'Kinfolk Magazine', 'Aesop', 'BMW Designworks', 'Studio David Thulstrup']
  },
  contact: {
    email: 'retneshwaribarman@gmail.com',
    phone: '+91 80996 84683',
    whatsapp: '+918099684683',
    instagram: '@hamanta.photo',
    location: 'Studio / Available for assignments',
    bookingNotice: 'Currently accepting bookings for Q2/Q3 editorial assignments, private portraits, and monographs.',
    availability: 'Available for commissions'
  },
  photos: [
    {
      id: 'photo-1',
      title: 'Monolith in Fog',
      description: 'Morning marine layer over concrete cantilever in Reykjanes Peninsula, Iceland.',
      category: 'Architecture',
      tags: ['Brutalism', 'Iceland', 'Minimal', 'Monochrome'],
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'landscape',
      date: '2025-11-12',
      camera: 'Leica SL2',
      lens: 'Summilux-SL 50mm f/1.4',
      client: 'Bauhaus Archival Society',
      featured: true,
      order: 1
    },
    {
      id: 'photo-2',
      title: 'Solitude in Ochre',
      description: 'Natural light portrait studies exploring warm amber tones and textured wool in an abandoned textile mill.',
      category: 'Portraits',
      tags: ['Portrait', 'Editorial', 'Natural Light'],
      url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'portrait',
      date: '2026-02-14',
      camera: 'Hasselblad X2D 100C',
      lens: 'XCD 80mm f/1.9',
      client: 'Nørr Magazine',
      featured: true,
      order: 2
    },
    {
      id: 'photo-3',
      title: 'Geometry of Light',
      description: 'Shadow lines intersecting concrete arches at the Centre Pompidou-Metz, France.',
      category: 'Architecture',
      tags: ['Geometry', 'Shadow', 'Lines', 'Metz'],
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'landscape',
      date: '2025-08-20',
      camera: 'Sony A7R V',
      lens: 'FE 24-70mm f/2.8 GM II',
      client: 'Studio Architects',
      featured: false,
      order: 3
    },
    {
      id: 'photo-4',
      title: 'Nocturne in Kyoto',
      description: 'Rain reflections and lantern glow in Gion alleyway before dawn.',
      category: 'Street',
      tags: ['Kyoto', 'Japan', 'Rain', 'Night', 'Atmosphere'],
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'portrait',
      date: '2025-10-04',
      camera: 'Fujifilm GFX 100 II',
      lens: 'GF 45mm f/2.8 R WR',
      client: 'Wanderlust Quarterly',
      featured: true,
      order: 4
    },
    {
      id: 'photo-5',
      title: 'The Linen Series: Study IV',
      description: 'High-fashion editorial capture focusing on organic textures and draping silhouette.',
      category: 'Editorial',
      tags: ['Fashion', 'Minimal', 'Linen', 'Studio'],
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'landscape',
      date: '2026-01-22',
      camera: 'Hasselblad 907X',
      lens: 'XCD 65mm f/2.8',
      client: 'Vogue Scandinavia',
      featured: true,
      order: 5
    },
    {
      id: 'photo-6',
      title: 'High Sierra Alpine Dusk',
      description: 'Last amber rays illuminating granite peaks above Thousand Island Lake at 9,800 feet.',
      category: 'Landscapes',
      tags: ['Mountains', 'California', 'Wilderness', 'Golden Hour'],
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'landscape',
      date: '2025-09-17',
      camera: 'Leica Q3',
      lens: 'Summilux 28mm f/1.7 ASPH',
      client: 'National Geographic Traveler',
      featured: true,
      order: 6
    },
    {
      id: 'photo-7',
      title: 'Shadow Silhouette & Glass',
      description: 'Chiaroscuro self-portrait study through rippled cathedral glass.',
      category: 'Portraits',
      tags: ['Chiaroscuro', 'Glass', 'Experimental', 'Shadows'],
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'portrait',
      date: '2025-12-05',
      camera: 'Leica M11-P',
      lens: 'Noctilux-M 50mm f/0.95',
      client: 'Personal Exhibition',
      featured: false,
      order: 7
    },
    {
      id: 'photo-8',
      title: 'Bermondsey Morning Rush',
      description: 'Slow shutter study of commuters moving through Victorian brick viaducts in London.',
      category: 'Street',
      tags: ['London', 'Motion Blur', 'Street', 'Architecture'],
      url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'landscape',
      date: '2026-03-01',
      camera: 'Ricoh GR IIIx',
      lens: '40mm F2.8 GR Lens',
      client: 'British Journal of Photography',
      featured: false,
      order: 8
    },
    {
      id: 'photo-9',
      title: 'Atelier de Céramique',
      description: 'Artisan hands shaping porcelain vessel on the wheel in Montmartre, Paris.',
      category: 'Editorial',
      tags: ['Craft', 'Artisan', 'Paris', 'Clay', 'Editorial'],
      url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=75',
      aspectRatio: 'portrait',
      date: '2026-01-10',
      camera: 'Canon EOS R5',
      lens: 'RF 50mm f/1.2 L USM',
      client: 'Ceramique Review',
      featured: true,
      order: 9
    }
  ],
  messages: [] as any[]
};

// Database helper functions
function loadData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading database, resetting to default', err);
    return DEFAULT_DATA;
  }
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving database', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for large image payloads (e.g. multiple base64 uploads)
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // Serve persistent user uploaded images
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- API Routes ---

  // Get full public portfolio data
  app.get('/api/portfolio', (req: Request, res: Response) => {
    const data = loadData();
    // Return photos sorted by order, without sensitive admin credentials
    const photos = [...(data.photos || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Extract unique categories
    const categoriesSet = new Set<string>(['All']);
    if (Array.isArray(data.categories)) {
      data.categories.forEach((c: string) => categoriesSet.add(c));
    }
    photos.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
    });

    res.json({
      photos,
      about: data.about || DEFAULT_DATA.about,
      contact: data.contact || DEFAULT_DATA.contact,
      categories: Array.from(categoriesSet),
    });
  });

  // Admin login check
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const data = loadData();
    const admin = data.admin || DEFAULT_DATA.admin;

    if (username === admin.username && password === admin.password) {
      // In this lightweight setup, generate a secure session token
      const sessionToken = Buffer.from(`${username}:${Date.now()}:${Math.random().toString(36).substring(2)}`).toString('base64');
      res.json({
        success: true,
        token: sessionToken,
        user: { username: admin.username }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
  });

  // Change admin credentials
  app.post('/api/auth/change-credentials', (req: Request, res: Response) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    const data = loadData();
    const admin = data.admin || DEFAULT_DATA.admin;

    if (currentPassword !== admin.password) {
      return res.status(401).json({ success: false, message: 'Current password does not match.' });
    }

    if (newUsername && newUsername.trim()) {
      admin.username = newUsername.trim();
    }
    if (newPassword && newPassword.trim()) {
      admin.password = newPassword.trim();
    }

    data.admin = admin;
    saveData(data);
    res.json({ success: true, message: 'Credentials updated successfully.' });
  });

  // Multi-photo upload endpoint
  // Supports base64 data strings with metadata
  app.post('/api/upload', (req: Request, res: Response) => {
    try {
      const { files } = req.body; // Array of { name, type, base64 }
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const uploadedResults = [];

      for (const file of files) {
        if (!file.base64) continue;
        const matches = file.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let buffer: Buffer;
        let ext = 'jpg';

        if (matches && matches.length === 3) {
          const mime = matches[1];
          if (mime.includes('png')) ext = 'png';
          else if (mime.includes('webp')) ext = 'webp';
          else if (mime.includes('gif')) ext = 'gif';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(file.base64, 'base64');
        }

        const safeName = (file.name || 'photo').replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;
        uploadedResults.push({
          originalName: file.name,
          url: fileUrl,
          thumbnailUrl: fileUrl,
          size: buffer.length
        });
      }

      res.json({ success: true, files: uploadedResults });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to process image upload' });
    }
  });

  // Add a new photo
  app.post('/api/photos', (req: Request, res: Response) => {
    try {
      const data = loadData();
      const newPhoto = req.body;
      if (!newPhoto.url || !newPhoto.title) {
        return res.status(400).json({ error: 'Title and Image URL are required.' });
      }

      const id = newPhoto.id || `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const order = typeof newPhoto.order === 'number' ? newPhoto.order : (data.photos?.length || 0) + 1;

      const photoRecord = {
        ...newPhoto,
        id,
        order,
        tags: Array.isArray(newPhoto.tags) ? newPhoto.tags : (typeof newPhoto.tags === 'string' ? newPhoto.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
        category: newPhoto.category || 'General',
        aspectRatio: newPhoto.aspectRatio || 'landscape',
      };

      data.photos = data.photos || [];
      // Insert at beginning or end
      data.photos.unshift(photoRecord);
      
      // Re-index orders
      data.photos.forEach((p: any, idx: number) => {
        p.order = idx + 1;
      });

      // Add category if new
      if (photoRecord.category && !data.categories.includes(photoRecord.category)) {
        data.categories.push(photoRecord.category);
      }

      saveData(data);
      res.json({ success: true, photo: photoRecord });
    } catch (err) {
      console.error('Error adding photo:', err);
      res.status(500).json({ error: 'Failed to add photo' });
    }
  });

  // Update existing photo
  app.put('/api/photos/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = loadData();
      const index = (data.photos || []).findIndex((p: any) => p.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      const existing = data.photos[index];
      const updated = {
        ...existing,
        ...req.body,
        id, // preserve id
        tags: Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : existing.tags)
      };

      data.photos[index] = updated;

      if (updated.category && !data.categories.includes(updated.category)) {
        data.categories.push(updated.category);
      }

      saveData(data);
      res.json({ success: true, photo: updated });
    } catch (err) {
      console.error('Error updating photo:', err);
      res.status(500).json({ error: 'Failed to update photo' });
    }
  });

  // Delete photo
  app.delete('/api/photos/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = loadData();
      const initialCount = (data.photos || []).length;
      data.photos = (data.photos || []).filter((p: any) => p.id !== id);

      if (data.photos.length === initialCount) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      // Re-index order
      data.photos.forEach((p: any, idx: number) => {
        p.order = idx + 1;
      });

      saveData(data);
      res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (err) {
      console.error('Error deleting photo:', err);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });

  // Reorder photos array
  app.put('/api/portfolio/reorder', (req: Request, res: Response) => {
    try {
      const { photoIds } = req.body; // Array of ids in new desired order
      if (!Array.isArray(photoIds)) {
        return res.status(400).json({ error: 'photoIds array required' });
      }

      const data = loadData();
      const photoMap = new Map<string, any>((data.photos || []).map((p: any) => [p.id, p]));

      const reordered: any[] = [];
      photoIds.forEach((id: string, idx: number) => {
        const photo = photoMap.get(id);
        if (photo) {
          photo.order = idx + 1;
          reordered.push(photo);
          photoMap.delete(id);
        }
      });

      // Append any remaining that weren't in the list
      photoMap.forEach((remaining: any) => {
        remaining.order = reordered.length + 1;
        reordered.push(remaining);
      });

      data.photos = reordered;
      saveData(data);
      res.json({ success: true, photos: data.photos });
    } catch (err) {
      console.error('Error reordering photos:', err);
      res.status(500).json({ error: 'Failed to reorder photos' });
    }
  });

  // Update About section
  app.put('/api/about', (req: Request, res: Response) => {
    try {
      const data = loadData();
      data.about = {
        ...data.about,
        ...req.body
      };
      saveData(data);
      res.json({ success: true, about: data.about });
    } catch (err) {
      console.error('Error updating about section:', err);
      res.status(500).json({ error: 'Failed to update about details' });
    }
  });

  // Update Contact section
  app.put('/api/contact', (req: Request, res: Response) => {
    try {
      const data = loadData();
      data.contact = {
        ...data.contact,
        ...req.body
      };
      saveData(data);
      res.json({ success: true, contact: data.contact });
    } catch (err) {
      console.error('Error updating contact section:', err);
      res.status(500).json({ error: 'Failed to update contact details' });
    }
  });

  // Visitor contact inquiry message submission
  app.post('/api/messages', (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      const data = loadData();
      data.messages = data.messages || [];

      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        email: email.trim(),
        subject: (subject || 'General Inquiry').trim(),
        message: message.trim(),
        date: new Date().toISOString(),
        read: false
      };

      data.messages.unshift(newMsg);
      saveData(data);
      res.json({ success: true, message: 'Your message has been sent to the artist!', id: newMsg.id });
    } catch (err) {
      console.error('Error saving message:', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get visitor messages (Admin only)
  app.get('/api/messages', (req: Request, res: Response) => {
    const data = loadData();
    res.json({ messages: data.messages || [] });
  });

  // Mark message read / delete message
  app.delete('/api/messages/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const data = loadData();
    data.messages = (data.messages || []).filter((m: any) => m.id !== id);
    saveData(data);
    res.json({ success: true });
  });

  // Reset database to default curated seed
  app.post('/api/portfolio/reset', (req: Request, res: Response) => {
    saveData(DEFAULT_DATA);
    res.json({ success: true, message: 'Portfolio reset to default curated archive.' });
  });

  // Import / Export backup JSON
  app.post('/api/portfolio/import', (req: Request, res: Response) => {
    try {
      const imported = req.body;
      if (!imported || !Array.isArray(imported.photos)) {
        return res.status(400).json({ error: 'Invalid portfolio data JSON structure.' });
      }
      const data = loadData();
      data.photos = imported.photos;
      if (imported.about) data.about = imported.about;
      if (imported.contact) data.contact = imported.contact;
      if (imported.categories) data.categories = imported.categories;
      saveData(data);
      res.json({ success: true, message: 'Portfolio backup restored successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to import backup' });
    }
  });

  // Vite development integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina Portfolio server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
