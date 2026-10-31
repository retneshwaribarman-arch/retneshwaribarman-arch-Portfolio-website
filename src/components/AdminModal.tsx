import React, { useState, useEffect } from 'react';
import { Photo, AboutData, ContactData, ClientMessage } from '../types';
import {
  loginAdmin,
  changeAdminCredentials,
  uploadImages,
  createPhoto,
  updatePhoto,
  deletePhoto,
  reorderPhotos,
  updateAbout,
  updateContact,
  fetchMessages,
  deleteMessage,
  resetPortfolio,
  importPortfolio,
} from '../api';
import {
  X,
  Lock,
  Upload,
  Image as ImageIcon,
  Move,
  Trash2,
  Edit,
  Save,
  Check,
  AlertCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  User,
  Phone,
  Inbox,
  Shield,
  HelpCircle,
  Download,
  RotateCcw,
  Sparkles,
  Link,
  MessageCircle,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  about: AboutData;
  contact: ContactData;
  categories: string[];
  isLoggedIn: boolean;
  onLoginSuccess: (token: string, username: string) => void;
  onLogout: () => void;
  onDataRefresh: () => void;
  initialTab?: string;
  onOpenDeployGuide: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  photos,
  about,
  contact,
  categories,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  onDataRefresh,
  initialTab = 'upload',
  onOpenDeployGuide,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Upload state
  const [uploadFilesQueue, setUploadFilesQueue] = useState<Array<{
    file?: File;
    previewUrl: string;
    title: string;
    category: string;
    tags: string;
    description: string;
    aspectRatio: 'landscape' | 'portrait' | 'square';
    camera: string;
    lens: string;
    client: string;
    featured: boolean;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Reorder state (local copy of photos)
  const [orderedPhotos, setOrderedPhotos] = useState<Photo[]>(photos);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Edit single photo modal
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  // About form state
  const [aboutForm, setAboutForm] = useState<AboutData>(about);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutSaved, setAboutSaved] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState<ContactData>(contact);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  // Inquiries messages
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Security / Credentials
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credMsg, setCredMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setOrderedPhotos(photos);
  }, [photos]);

  useEffect(() => {
    setAboutForm(about);
  }, [about]);

  useEffect(() => {
    setContactForm(contact);
  }, [contact]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load inquiries when messages tab is selected
  useEffect(() => {
    if (isLoggedIn && activeTab === 'messages') {
      setLoadingMessages(true);
      fetchMessages()
        .then((res) => setMessages(res))
        .finally(() => setLoadingMessages(false));
    }
  }, [isLoggedIn, activeTab]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await loginAdmin(usernameInput, passwordInput);
      if (res.success && res.token) {
        onLoginSuccess(res.token, res.user?.username || 'admin');
        setUsernameInput('');
        setPasswordInput('');
      } else {
        setLoginError(res.message || 'Invalid username or password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check server.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle File Selection for Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const previewUrl = uploadEvent.target?.result as string;
        // Guess aspect ratio by image loading
        const img = new Image();
        img.onload = () => {
          let ratio: 'landscape' | 'portrait' | 'square' = 'landscape';
          if (img.width === img.height) ratio = 'square';
          else if (img.height > img.width) ratio = 'portrait';

          const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

          setUploadFilesQueue((prev) => [
            ...prev,
            {
              file,
              previewUrl,
              title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
              category: categories[1] || 'Editorial',
              tags: 'photography, artwork',
              description: '',
              aspectRatio: ratio,
              camera: '',
              lens: '',
              client: '',
              featured: false,
            },
          ]);
        };
        img.src = previewUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit all uploaded files to server
  const handleExecuteUpload = async () => {
    if (uploadFilesQueue.length === 0) return;
    setIsUploading(true);
    setUploadSuccessMsg('');

    try {
      // 1. Prepare base64 files
      const base64List = uploadFilesQueue.map((item) => ({
        name: item.file?.name || `${item.title}.jpg`,
        base64: item.previewUrl,
      }));

      // 2. Upload to storage
      const uploadedResults = await uploadImages(base64List);

      // 3. Create photo records in database
      for (let i = 0; i < uploadedResults.length; i++) {
        const fileInfo = uploadedResults[i];
        const queueMeta = uploadFilesQueue[i];

        await createPhoto({
          title: queueMeta.title || fileInfo.originalName,
          category: queueMeta.category,
          description: queueMeta.description,
          tags: queueMeta.tags.split(',').map((t) => t.trim()).filter(Boolean),
          url: fileInfo.url,
          thumbnailUrl: fileInfo.thumbnailUrl,
          aspectRatio: queueMeta.aspectRatio,
          camera: queueMeta.camera,
          lens: queueMeta.lens,
          client: queueMeta.client,
          featured: queueMeta.featured,
          date: new Date().toISOString().split('T')[0],
        });
      }

      setUploadFilesQueue([]);
      setUploadSuccessMsg(`Successfully uploaded and saved ${uploadedResults.length} photos!`);
      onDataRefresh();
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Reordering Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...orderedPhotos];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setOrderedPhotos(updated);
  };

  const handleMovePhoto = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= orderedPhotos.length) return;

    const updated = [...orderedPhotos];
    const item = updated[fromIndex];
    updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    setOrderedPhotos(updated);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const ids = orderedPhotos.map((p) => p.id);
      await reorderPhotos(ids);
      onDataRefresh();
    } catch (err: any) {
      alert('Failed to save order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await deletePhoto(id);
      onDataRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Save edited photo
  const handleSaveEditedPhoto = async () => {
    if (!editingPhoto) return;
    try {
      await updatePhoto(editingPhoto.id, editingPhoto);
      setEditingPhoto(null);
      onDataRefresh();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Save About info
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setAboutSaving(true);
    try {
      await updateAbout(aboutForm);
      setAboutSaved(true);
      onDataRefresh();
      setTimeout(() => setAboutSaved(false), 3000);
    } catch (err: any) {
      alert(`Failed to save About: ${err.message}`);
    } finally {
      setAboutSaving(false);
    }
  };

  // Save Contact info
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaving(true);
    try {
      await updateContact(contactForm);
      setContactSaved(true);
      onDataRefresh();
      setTimeout(() => setContactSaved(false), 3000);
    } catch (err: any) {
      alert(`Failed to save Contact: ${err.message}`);
    } finally {
      setContactSaving(false);
    }
  };

  // Change Credentials
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);
    try {
      const res = await changeAdminCredentials({
        currentPassword,
        newUsername,
        newPassword,
      });
      if (res.success) {
        setCredMsg({ text: 'Credentials updated successfully!', isError: false });
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
      } else {
        setCredMsg({ text: res.message || 'Error updating credentials', isError: true });
      }
    } catch (err: any) {
      setCredMsg({ text: err.message, isError: true });
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const fullBackup = {
      photos,
      about,
      contact,
      categories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!confirm('This will replace current portfolio photos and settings with the backup file. Proceed?')) return;
        await importPortfolio(parsed);
        alert('Portfolio restored successfully!');
        onDataRefresh();
      } catch (err) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  // Reset to original seed
  const handleResetData = async () => {
    if (!confirm('Reset entire gallery to default curated archive? Any added photos will be replaced.')) return;
    try {
      await resetPortfolio();
      alert('Portfolio reset successfully.');
      onDataRefresh();
    } catch (err: any) {
      alert('Reset failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">Studio Admin Panel</h2>
              <p className="text-[11px] text-neutral-400 font-light">
                {isLoggedIn ? 'Manage photos, content, inquiries, and settings' : 'Authentication required to edit portfolio'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="text-xs text-neutral-400 hover:text-rose-400 px-3 py-1.5 rounded-full border border-neutral-800 hover:border-rose-900/40 transition-colors"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In View */}
        {!isLoggedIn ? (
          <div className="p-8 max-w-md mx-auto w-full py-16">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-neutral-800/80 text-amber-400 mb-3 border border-neutral-700">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-white">Photographer Access</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your studio credentials to access photo uploads, drag-and-drop reordering, and profile edits.
              </p>
            </div>

            {loginError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 mt-2"
              >
                {loginLoading ? 'Verifying...' : 'Unlock Studio Panel'}
              </button>

              {/* Convenience Demo Credentials Button */}
              <div className="pt-4 border-t border-neutral-800/80 text-center">
                <p className="text-[11px] text-neutral-500 mb-2">Default Studio Credentials:</p>
                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput('admin');
                    setPasswordInput('password123');
                  }}
                  className="text-xs text-amber-400/90 hover:text-amber-300 underline underline-offset-4"
                >
                  Autofill Default: admin / password123
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Logged In Workspace */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="px-6 border-b border-neutral-800 bg-neutral-950/40 flex items-center space-x-1 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: 'upload', label: 'Upload Photos', icon: Upload },
                { id: 'gallery', label: `Manage & Reorder (${photos.length})`, icon: Move },
                { id: 'about', label: 'Edit About', icon: User },
                { id: 'contact', label: 'Edit Contact', icon: Phone },
                { id: 'messages', label: `Inquiries (${messages.length})`, icon: Inbox },
                { id: 'settings', label: 'Settings & Backup', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3.5 px-3.5 border-b-2 text-xs font-medium tracking-wide flex items-center space-x-2 transition-all whitespace-nowrap ${
                      active
                        ? 'border-amber-500 text-white font-semibold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: UPLOAD PHOTOS */}
              {activeTab === 'upload' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {uploadSuccessMsg && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}

                  {/* Dropzone Container */}
                  <label className="border-2 border-dashed border-neutral-700 hover:border-amber-500/70 bg-neutral-950/40 hover:bg-neutral-950/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="p-4 rounded-full bg-neutral-800 text-neutral-300 group-hover:scale-110 group-hover:text-amber-400 transition-all mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif text-lg text-white font-medium mb-1">
                      Drop Photos Here or Click to Browse
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-md">
                      Upload multiple high-resolution photos (JPG, PNG, or WebP). Automatic compression and persistent storage enabled.
                    </p>
                    <span className="mt-4 px-4 py-1.5 rounded-full bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black text-xs font-semibold tracking-wider uppercase transition-colors">
                      Select Files
                    </span>
                  </label>

                  {/* Queued Photos List */}
                  {uploadFilesQueue.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                          Photos Ready to Upload ({uploadFilesQueue.length})
                        </h4>
                        <button
                          onClick={() => setUploadFilesQueue([])}
                          className="text-xs text-neutral-400 hover:text-rose-400"
                        >
                          Clear Queue
                        </button>
                      </div>

                      <div className="space-y-4">
                        {uploadFilesQueue.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row gap-4 items-start"
                          >
                            {/* Preview Thumbnail */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                              <img
                                src={item.previewUrl}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Metadata Editor Inputs */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                  Title *
                                </label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    const next = [...uploadFilesQueue];
                                    next[idx].title = e.target.value;
                                    setUploadFilesQueue(next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                  Category
                                </label>
                                <select
                                  value={item.category}
                                  onChange={(e) => {
                                    const next = [...uploadFilesQueue];
                                    next[idx].category = e.target.value;
                                    setUploadFilesQueue(next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white"
                                >
                                  {categories.filter((c) => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                  <option value="Fine Art">Fine Art</option>
                                  <option value="Conceptual">Conceptual</option>
                                  <option value="Documentary">Documentary</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                  Tags (comma separated)
                                </label>
                                <input
                                  type="text"
                                  placeholder="minimal, bw, shadow"
                                  value={item.tags}
                                  onChange={(e) => {
                                    const next = [...uploadFilesQueue];
                                    next[idx].tags = e.target.value;
                                    setUploadFilesQueue(next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                  Camera Gear
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Leica SL2"
                                  value={item.camera}
                                  onChange={(e) => {
                                    const next = [...uploadFilesQueue];
                                    next[idx].camera = e.target.value;
                                    setUploadFilesQueue(next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                  Lens
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 50mm f/1.4"
                                  value={item.lens}
                                  onChange={(e) => {
                                    const next = [...uploadFilesQueue];
                                    next[idx].lens = e.target.value;
                                    setUploadFilesQueue(next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white"
                                />
                              </div>

                              <div className="flex items-center space-x-3 pt-4">
                                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.featured}
                                    onChange={(e) => {
                                      const next = [...uploadFilesQueue];
                                      next[idx].featured = e.target.checked;
                                      setUploadFilesQueue(next);
                                    }}
                                    className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                                  />
                                  <span>Mark Featured</span>
                                </label>
                              </div>
                            </div>

                            {/* Remove item button */}
                            <button
                              onClick={() => {
                                setUploadFilesQueue(uploadFilesQueue.filter((_, i) => i !== idx));
                              }}
                              className="text-neutral-500 hover:text-rose-400 p-1 self-start"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleExecuteUpload}
                        disabled={isUploading}
                        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {isUploading
                            ? 'Processing & Storing Permanently...'
                            : `Save ${uploadFilesQueue.length} Photos to Portfolio`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANAGE & REORDER GALLERY */}
              {activeTab === 'gallery' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Drag & Drop Gallery Order</h4>
                      <p className="text-xs text-neutral-400">
                        Drag any row or use the Up/Down buttons to reorder photos on the live website.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveOrder}
                      disabled={isSavingOrder}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs tracking-wider uppercase transition-colors shadow-md flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingOrder ? 'Saving...' : 'Save Reordered Order'}</span>
                    </button>
                  </div>

                  {/* Reorderable List */}
                  <div className="space-y-2">
                    {orderedPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        className={`p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center space-x-3 transition-all ${
                          draggedIndex === index ? 'opacity-40 scale-[0.99] border-amber-500' : 'hover:border-neutral-700'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="cursor-grab text-neutral-500 hover:text-neutral-300 p-1">
                          <Move className="w-4 h-4" />
                        </div>

                        {/* Order Number */}
                        <span className="w-6 text-center text-xs font-mono text-neutral-500">
                          {index + 1}
                        </span>

                        {/* Thumbnail */}
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.title}
                          className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                        />

                        {/* Photo Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h5 className="text-xs font-semibold text-white truncate max-w-xs">
                              {photo.title}
                            </h5>
                            {photo.featured && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {photo.category} {photo.camera ? `• ${photo.camera}` : ''}
                          </p>
                        </div>

                        {/* Up / Down Controls */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMovePhoto(index, 'up')}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMovePhoto(index, 'down')}
                            disabled={index === orderedPhotos.length - 1}
                            title="Move Down"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingPhoto(photo)}
                          title="Edit Photo Details"
                          className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeletePhoto(photo.id, photo.title)}
                          title="Delete Photo"
                          className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: EDIT ABOUT ME */}
              {activeTab === 'about' && (
                <form onSubmit={handleSaveAbout} className="space-y-6 max-w-3xl mx-auto">
                  {aboutSaved && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>About section updated and saved permanently!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Artist Name
                      </label>
                      <input
                        type="text"
                        value={aboutForm.name}
                        onChange={(e) => setAboutForm({ ...aboutForm, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        value={aboutForm.title}
                        onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Portrait Photo URL
                    </label>
                    <input
                      type="url"
                      value={aboutForm.portraitUrl}
                      onChange={(e) => setAboutForm({ ...aboutForm, portraitUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Studio Location
                    </label>
                    <input
                      type="text"
                      value={aboutForm.location}
                      onChange={(e) => setAboutForm({ ...aboutForm, location: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                        Years Practice
                      </label>
                      <input
                        type="number"
                        value={aboutForm.yearsExperience}
                        onChange={(e) => setAboutForm({ ...aboutForm, yearsExperience: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                        Exhibitions
                      </label>
                      <input
                        type="number"
                        value={aboutForm.exhibitionsCount}
                        onChange={(e) => setAboutForm({ ...aboutForm, exhibitionsCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                        Awards
                      </label>
                      <input
                        type="number"
                        value={aboutForm.awardsCount}
                        onChange={(e) => setAboutForm({ ...aboutForm, awardsCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Artist Philosophy / Quote
                    </label>
                    <textarea
                      rows={2}
                      value={aboutForm.philosophy}
                      onChange={(e) => setAboutForm({ ...aboutForm, philosophy: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Biography Paragraph 1
                    </label>
                    <textarea
                      rows={3}
                      value={aboutForm.bio?.[0] || ''}
                      onChange={(e) => {
                        const newBio = [...(aboutForm.bio || [])];
                        newBio[0] = e.target.value;
                        setAboutForm({ ...aboutForm, bio: newBio });
                      }}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Biography Paragraph 2
                    </label>
                    <textarea
                      rows={3}
                      value={aboutForm.bio?.[1] || ''}
                      onChange={(e) => {
                        const newBio = [...(aboutForm.bio || [])];
                        newBio[1] = e.target.value;
                        setAboutForm({ ...aboutForm, bio: newBio });
                      }}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Select Clients & Publications (comma separated)
                    </label>
                    <input
                      type="text"
                      value={aboutForm.clients?.join(', ') || ''}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          clients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aboutSaving}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{aboutSaving ? 'Saving...' : 'Save About Section'}</span>
                  </button>
                </form>
              )}

              {/* TAB 4: EDIT CONTACT & WHATSAPP */}
              {activeTab === 'contact' && (
                <form onSubmit={handleSaveContact} className="space-y-6 max-w-3xl mx-auto">
                  {contactSaved && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Contact details and WhatsApp link saved!</span>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-neutral-300">
                      <p className="font-semibold text-emerald-400">WhatsApp One-Click Direct Chat</p>
                      <p className="mt-0.5 text-neutral-400">
                        Enter your international number with country code (e.g. +15552348900). Clients clicking "Chat on WhatsApp" will immediately open a chat with you.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+15552348900"
                        value={contactForm.whatsapp}
                        onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Direct Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Phone / Studio Call
                      </label>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        placeholder="@artist.photo"
                        value={contactForm.instagram}
                        onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Availability Status
                    </label>
                    <select
                      value={contactForm.availability}
                      onChange={(e: any) => setContactForm({ ...contactForm, availability: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    >
                      <option value="Available for commissions">Available for commissions</option>
                      <option value="Limited availability">Limited availability</option>
                      <option value="Booked through season">Booked through season</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Commission Booking Notice / Lead Time
                    </label>
                    <textarea
                      rows={3}
                      value={contactForm.bookingNotice}
                      onChange={(e) => setContactForm({ ...contactForm, bookingNotice: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactSaving}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{contactSaving ? 'Saving...' : 'Save Contact Details'}</span>
                  </button>
                </form>
              )}

              {/* TAB 5: CLIENT INQUIRIES */}
              {activeTab === 'messages' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Client Inquiries & Booking Requests</h4>
                      <p className="text-xs text-neutral-400">
                        Inquiries submitted through your public contact form are permanently stored here.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setLoadingMessages(true);
                        fetchMessages()
                          .then(setMessages)
                          .finally(() => setLoadingMessages(false));
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800"
                    >
                      Refresh Inbox
                    </button>
                  </div>

                  {loadingMessages ? (
                    <div className="text-center py-12 text-xs text-neutral-500">Loading inquiries...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-neutral-800 rounded-xl">
                      <Inbox className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400">No client messages yet.</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Test the public contact form on the homepage to see messages arrive here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                                {msg.subject}
                              </span>
                              <h5 className="text-sm font-semibold text-white mt-1.5">
                                {msg.name} <span className="font-normal text-xs text-neutral-400">({msg.email})</span>
                              </h5>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="text-[11px] text-neutral-500 font-mono">
                                {new Date(msg.date).toLocaleDateString()}
                              </span>
                              <button
                                onClick={async () => {
                                  await deleteMessage(msg.id);
                                  setMessages(messages.filter((m) => m.id !== msg.id));
                                }}
                                className="text-neutral-500 hover:text-rose-400 p-1"
                                title="Delete inquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed font-light whitespace-pre-wrap bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/60">
                            {msg.message}
                          </p>

                          <div className="pt-1">
                            <a
                              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                              className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:underline"
                            >
                              <span>Reply via Email →</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SETTINGS, BACKUP & CREDENTIALS */}
              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  {/* Change Credentials Form */}
                  <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <h4 className="font-serif text-base text-white font-medium mb-1">
                      Change Admin Login Credentials
                    </h4>
                    <p className="text-xs text-neutral-400 mb-4">
                      Update the username and password used to access this Studio Panel.
                    </p>

                    {credMsg && (
                      <div
                        className={`p-3 rounded-xl mb-4 text-xs ${
                          credMsg.isError
                            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {credMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleChangeCredentials} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                            New Username (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="admin"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                            New Password (optional)
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="mt-2 px-6 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Update Credentials
                      </button>
                    </form>
                  </div>

                  {/* Portfolio Backup & Restore */}
                  <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <h4 className="font-serif text-base text-white font-medium mb-1">
                      Data Backup & Restoration
                    </h4>
                    <p className="text-xs text-neutral-400 mb-4">
                      Export your entire portfolio (photos, about, contacts, order) as a JSON file, or restore from a previous backup.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleExportJSON}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-white font-medium flex items-center space-x-2 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download JSON Backup</span>
                      </button>

                      <label className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-white font-medium flex items-center space-x-2 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restore from JSON</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJSON}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Reset Archive */}
                  <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm text-white font-medium">Reset Demo Archive</h4>
                      <p className="text-xs text-neutral-400">
                        Restore default sample photography archive and reset all settings.
                      </p>
                    </div>
                    <button
                      onClick={handleResetData}
                      className="px-3 py-1.5 rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/30 text-xs font-medium transition-colors"
                    >
                      Reset Data
                    </button>
                  </div>

                  {/* Quick link to Deployment guide */}
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm text-amber-400 font-medium">Ready to Publish for Free?</h4>
                      <p className="text-xs text-neutral-300">
                        Read the step-by-step setup guide for free deployment on Vercel, Netlify, and Cloud storage.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenDeployGuide();
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-wider transition-colors shrink-0"
                    >
                      View Guide
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Photo Dialog Overlay */}
        {editingPhoto && (
          <div className="fixed inset-0 z-60 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h4 className="font-serif text-base text-white font-medium">Edit Photograph</h4>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={editingPhoto.aspectRatio}
                    onChange={(e: any) => setEditingPhoto({ ...editingPhoto, aspectRatio: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingPhoto.description}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Camera
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.camera || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, camera: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Lens
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.lens || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, lens: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editingPhoto.featured || false}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, featured: e.target.checked })}
                    className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Featured photograph (badge on card)</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedPhoto}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
