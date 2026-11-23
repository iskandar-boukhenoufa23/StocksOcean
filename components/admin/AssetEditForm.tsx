'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Database } from '@/types/supabase'


type Asset = Database['public']['Tables']['assets']['Row']
type AssetWithProfile = Asset & {
  profiles: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'username' | 'avatar_url'
  > | null
}

interface AssetEditFormProps {
  asset: AssetWithProfile
}

export default function AssetEditForm({ asset }: AssetEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    title: asset.title || '',
    description: asset.description || '',
    type: asset.type || 'image',
    category: asset.category || '',
    price: asset.price?.toString() || '0',
    tags: asset.tags?.join(', ') || '',
    status: asset.status || 'pending',
    is_demo: asset.is_demo || false,
    is_featured: asset.is_featured || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          price: parseFloat(formData.price),
        }),
      })

      if (response.ok) {
        toast.success('Asset updated successfully!')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update asset')
      }
    } catch (error) {
      toast.error('Error updating asset')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/assets/${asset.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Asset deleted successfully!')
        router.push('/admin/assets')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete asset')
      }
    } catch (error) {
      toast.error('Error deleting asset')
    } finally {
      setLoading(false)
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-6">
          {/* Preview */}
          {asset.preview_path && (
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Preview</label>
              <img src={asset.preview_path} alt={asset.title} className="max-w-full rounded-lg" />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "            />
          </div>

          {/* Type, Category, Price */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="3d">3D Model</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_demo}
                onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 ">Demo Asset</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 ">Featured</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Delete Asset
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white  rounded-xl p-6 border border-gray-200 ">
          <h3 className="text-lg font-bold text-gray-900  mb-4">Asset Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 ">Views:</span>
              <span className="font-semibold text-gray-900 ">{asset.views || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 ">Downloads:</span>
              <span className="font-semibold text-gray-900 ">{asset.downloads || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 ">Created:</span>
              <span className="font-semibold text-gray-900 ">
                {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
            {asset.profiles && (
              <div className="flex justify-between">
                <span className="text-gray-600 ">Contributor:</span>
                <span className="font-semibold text-gray-900 ">{asset.profiles.username || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white  rounded-xl p-6 w-full max-w-md shadow-lg">
      
      <h2 className="text-xl font-bold text-gray-900  mb-2">
        Delete Asset
      </h2>

      <p className="text-gray-600  mb-6">
        Are you sure you want to delete this asset? This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 rounded-lg bg-gray-200  text-gray-800  hover:bg-gray-300 "
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

