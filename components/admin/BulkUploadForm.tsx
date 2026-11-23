'use client'
import { getErrorMessage } from '@/lib/errors'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface BulkFile {
  file: File
  title: string
  description: string
  category: string
  tags: string
  is_demo: boolean
  is_featured: boolean
  preview?: string
}

export default function BulkUploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<BulkFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ [key: number]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    const newFiles: BulkFile[] = selectedFiles.map((file) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      let fileType = 'image'
      if (fileExt === 'mp4') fileType = 'video'
      if (fileExt === 'glb') fileType = '3d'

      // Generate preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      return {
        file,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        description: '',
        category: '',
        tags: '',
        is_demo: false,
        is_featured: false,
        preview,
      }
    })

    setFiles((prev) => [...prev, ...newFiles])
  }

  const updateFile = (index: number, updates: Partial<BulkFile>) => {
    setFiles((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev]
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview!)
      }
      updated.splice(index, 1)
      return updated
    })
  }

 

const handleBulkUpload = async () => {
  if (files.length === 0) {
    setError('Please select files to upload')
    return
  }

  setUploading(true)
  setError(null)
  setSuccessCount(0)
  setProgress({})

  try {
    for (let i = 0; i < files.length; i++) {
      const bulkFile = files[i]
      try {
        setProgress((prev) => ({ ...prev, [i]: 10 }))

        // Prepare FormData for API
        const formData = new FormData()
        formData.append("file", bulkFile.file)
        formData.append("title", bulkFile.title)
        formData.append("description", bulkFile.description || "")
        formData.append("category", bulkFile.category || "")
        formData.append("tags", JSON.stringify(bulkFile.tags.split(',').map(t => t.trim()).filter(Boolean)))
        formData.append("type", bulkFile.file.type.startsWith("video/") ? "video" : bulkFile.file.type.startsWith("image/") ? "image" : "other")
        formData.append("license", "standard") // or whatever your default is

        setProgress((prev) => ({ ...prev, [i]: 30 }))

        // Call your API
        const res = await fetch('/api/assets/create', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        setProgress((prev) => ({ ...prev, [i]: 100 }))
        setSuccessCount((prev) => prev + 1)
      } catch (err: unknown) {
        console.error(`Error uploading file ${bulkFile.file.name}:`, err)
        setError(`Error uploading ${bulkFile.file.name}: ${getErrorMessage(err)}`)
      }
    }

    // Redirect after all uploads succeed
    if (successCount === files.length) {
      setTimeout(() => router.push('/admin/assets'), 1500)
    }
  } catch (err: unknown) {
    setError(getErrorMessage(err) || 'Bulk upload failed')
  } finally {
    setUploading(false)
  }
}



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900  mb-2">Bulk Upload Assets</h2>
        <p className="text-gray-600 ">Upload multiple assets at once</p>
      </div>

      {error && (
        <div className="bg-red-50  border border-red-200  rounded-lg p-4">
          <p className="text-sm text-red-800 ">{error}</p>
        </div>
      )}

      {successCount > 0 && (
        <div className="bg-green-50  border border-green-200  rounded-lg p-4">
          <p className="text-sm text-green-800 ">
            Successfully uploaded {successCount} of {files.length} files
          </p>
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,.glb"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
            Select Multiple Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((bulkFile, index) => (
            <div
              key={index}
              className="bg-white  rounded-xl p-6 border border-gray-200 "
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {bulkFile.preview ? (
                    <img src={bulkFile.preview} alt="Preview" className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-gray-200  rounded flex items-center justify-center">
                      <span className="text-gray-400">{bulkFile.file.name}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600  mt-2 truncate">
                    {bulkFile.file.name}
                  </p>
                  {progress[index] !== undefined && (
                    <div className="mt-2 w-full bg-gray-200  rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress[index]}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={bulkFile.title}
                      onChange={(e) => updateFile(index, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={bulkFile.category}
                      onChange={(e) => updateFile(index, { category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={bulkFile.tags}
                      onChange={(e) => updateFile(index, { tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  text-sm"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bulkFile.is_demo}
                        onChange={(e) => updateFile(index, { is_demo: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-gray-700 ">Demo</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bulkFile.is_featured}
                        onChange={(e) => updateFile(index, { is_featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-gray-700 ">Featured</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-auto text-red-600 hover:text-red-700  text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={handleBulkUpload}
              disabled={uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `Upload All (${files.length} files)`}
            </button>
            <button
              onClick={() => {
                files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
                setFiles([])
              }}
              className="px-6 py-3 bg-gray-200  text-gray-900  rounded-lg hover:bg-gray-300  transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

