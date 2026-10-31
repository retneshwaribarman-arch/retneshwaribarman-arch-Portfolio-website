import { PortfolioData, Photo, AboutData, ContactData, ClientMessage } from './types';

export async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch('/api/portfolio');
  if (!res.ok) {
    throw new Error('Failed to load portfolio');
  }
  return res.json();
}

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string; user?: { username: string } }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function changeAdminCredentials(payload: { currentPassword: string; newUsername?: string; newPassword?: string }) {
  const res = await fetch('/api/auth/change-credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function uploadImages(files: { name: string; base64: string }[]): Promise<{ url: string; thumbnailUrl: string; originalName: string }[]> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'Upload failed');
  }
  const data = await res.json();
  return data.files;
}

export async function createPhoto(photo: Partial<Photo>): Promise<{ success: boolean; photo: Photo }> {
  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create photo' }));
    throw new Error(err.error || 'Failed to create photo');
  }
  return res.json();
}

export async function updatePhoto(id: string, updates: Partial<Photo>): Promise<{ success: boolean; photo: Photo }> {
  const res = await fetch(`/api/photos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update photo' }));
    throw new Error(err.error || 'Failed to update photo');
  }
  return res.json();
}

export async function deletePhoto(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/photos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete photo' }));
    throw new Error(err.error || 'Failed to delete photo');
  }
  return res.json();
}

export async function reorderPhotos(photoIds: string[]): Promise<{ success: boolean; photos: Photo[] }> {
  const res = await fetch('/api/portfolio/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoIds }),
  });
  if (!res.ok) {
    throw new Error('Failed to reorder photos');
  }
  return res.json();
}

export async function updateAbout(about: Partial<AboutData>): Promise<{ success: boolean; about: AboutData }> {
  const res = await fetch('/api/about', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(about),
  });
  if (!res.ok) {
    throw new Error('Failed to update About details');
  }
  return res.json();
}

export async function updateContact(contact: Partial<ContactData>): Promise<{ success: boolean; contact: ContactData }> {
  const res = await fetch('/api/contact', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  });
  if (!res.ok) {
    throw new Error('Failed to update contact info');
  }
  return res.json();
}

export async function sendContactMessage(payload: { name: string; email: string; subject: string; message: string }) {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

export async function fetchMessages(): Promise<ClientMessage[]> {
  const res = await fetch('/api/messages');
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
}

export async function deleteMessage(id: string): Promise<boolean> {
  const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function resetPortfolio(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/portfolio/reset', { method: 'POST' });
  return res.json();
}

export async function importPortfolio(data: any): Promise<{ success: boolean }> {
  const res = await fetch('/api/portfolio/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
