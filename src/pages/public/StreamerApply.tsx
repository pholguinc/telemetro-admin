import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/environment';

type SocialLinks = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
};

const categories = [
  { value: '', label: 'Selecciona categoría (opcional)' },
  { value: 'irl', label: 'IRL' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art' },
  { value: 'food', label: 'Food' },
  { value: 'tech', label: 'Tech' },
  { value: 'dance', label: 'Dance' },
  { value: 'freestyle', label: 'Freestyle' },
  { value: 'event', label: 'Event' },
];

const StreamerApply: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prefill from URL params: ?userId=...&email=...&username=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pUserId = params.get('userId') || '';
    const pEmail = params.get('email') || '';
    const pUsername = params.get('username') || '';
    if (pUserId) setUserId(pUserId);
    if (pEmail) setEmail(pEmail);
    if (pUsername) setUsername(pUsername);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (!userId) throw new Error('Falta userId en el enlace');
      const payload: any = { userId, email, username };
      if (displayName) payload.displayName = displayName;
      if (bio) payload.bio = bio;
      if (category) payload.category = category;
      if (socialLinks && Object.values(socialLinks).some(Boolean)) payload.socialLinks = socialLinks;

      const res = await fetch(`${API_BASE_URL || ''}/streamers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || 'Error al enviar solicitud';
        throw new Error(msg);
      }
      setMessage('Solicitud enviada con éxito. Estado: pending');
    } catch (err: any) {
      setError(err?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Solicitud para ser Metro Streamer</h1>
        <p className="text-gray-600 mb-6">Este formulario es público. Debes ingresar tu userId, email y username que coincidan exactamente con tu cuenta.</p>

        {message && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-700 p-3">{message}</div>
        )}
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 p-3">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* userId oculto: se envía en payload pero no se muestra */}
          <input type="hidden" value={userId} readOnly />
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username (metroUsername)</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="tu_username"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name (opcional)</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Cómo quieres mostrarte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría (opcional)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio (opcional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Cuéntanos brevemente sobre ti"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
              <input
                value={socialLinks.twitter || ''}
                onChange={(e) => setSocialLinks((s) => ({ ...s, twitter: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="@usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                value={socialLinks.instagram || ''}
                onChange={(e) => setSocialLinks((s) => ({ ...s, instagram: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="@usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube</label>
              <input
                value={socialLinks.youtube || ''}
                onChange={(e) => setSocialLinks((s) => ({ ...s, youtube: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Canal o URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TikTok</label>
              <input
                value={socialLinks.tiktok || ''}
                onChange={(e) => setSocialLinks((s) => ({ ...s, tiktok: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="@usuario"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>Endpoint: <code>/api/streamers/apply</code></p>
        </div>
      </div>
    </div>
  );
};

export default StreamerApply;


