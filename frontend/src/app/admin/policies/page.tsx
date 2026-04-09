'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Policy {
  slug: string;
  title: string;
  metaDescription: string | null;
  content: string;
  updatedTime: string;
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [form, setForm] = useState({ title: '', metaDescription: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch(`${API}/api/policies`);
      if (res.ok) setPolicies(await res.json());
    } catch {
      setMessage({ type: 'error', text: 'Failed to load policies' });
    }
  }

  function openEdit(p: Policy) {
    setEditing(p);
    setForm({
      title: p.title,
      metaDescription: p.metaDescription || '',
      content: p.content,
    });
    setMessage(null);
  }

  function cancel() {
    setEditing(null);
    setForm({ title: '', metaDescription: '', content: '' });
    setMessage(null);
  }

  async function save() {
    if (!editing) return;
    if (!form.title.trim() || !form.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await authFetch(`${API}/api/admin/policies/${editing.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Policy updated successfully' });
        await load();
        setEditing(null);
        setForm({ title: '', metaDescription: '', content: '' });
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: 'error', text: err?.error || 'Failed to save policy' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-bark">Edit Policy</h1>
            <p className="font-ui text-xs text-bark-light/60 mt-1">/{editing.slug}</p>
          </div>
          <button onClick={cancel} className="btn-outline">
            Cancel
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded font-ui text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div>
            <label className="block font-ui text-xs font-semibold text-bark mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field w-full"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block font-ui text-xs font-semibold text-bark mb-1">
              Meta Description (for SEO)
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              rows={2}
              className="input-field w-full"
              maxLength={500}
              placeholder="Short description shown in Google search results"
            />
            <p className="font-ui text-xs text-bark-light/60 mt-1">
              {form.metaDescription.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block font-ui text-xs font-semibold text-bark mb-1">
              Content (HTML) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={25}
              className="input-field w-full font-mono text-xs"
              placeholder="<h2>Section Title</h2>&#10;<p>Paragraph text...</p>&#10;<ul><li>List item</li></ul>"
            />
            <p className="font-ui text-xs text-bark-light/60 mt-1">
              Use HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a href=&quot;...&quot;&gt;
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={cancel} className="btn-outline">
              Cancel
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold text-bark mb-3">Live Preview</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="font-display text-2xl font-bold text-bark mb-2">{form.title || 'Untitled'}</h1>
            <div className="gold-divider mb-4" />
            <div
              className="prose-policy"
              dangerouslySetInnerHTML={{ __html: form.content }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-bark">Policies</h1>
        <p className="font-ui text-sm text-bark-light/60 mt-1">
          Manage policy pages: privacy, terms, shipping, returns
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded font-ui text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream-warm">
            <tr>
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold text-bark uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold text-bark uppercase tracking-wider">
                Slug
              </th>
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold text-bark uppercase tracking-wider">
                Last Updated
              </th>
              <th className="text-right px-4 py-3 font-ui text-xs font-semibold text-bark uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-deep">
            {policies.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 font-ui text-sm text-bark-light/60">
                  No policies found
                </td>
              </tr>
            ) : (
              policies.map((p) => (
                <tr key={p.slug} className="hover:bg-cream-warm/40 transition-colors">
                  <td className="px-4 py-3 font-ui text-sm font-medium text-bark">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-bark-light">/{p.slug}</td>
                  <td className="px-4 py-3 font-ui text-xs text-bark-light">
                    {new Date(p.updatedTime).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="font-ui text-sm text-maroon hover:text-maroon-deep underline underline-offset-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
