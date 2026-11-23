'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LevelBadge from '@/components/contributor/LevelBadge'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'



type Profile = Database['public']['Tables']['profiles']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']
type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row']
type SubscriptionWithPlan = Subscription & { subscription_plans: SubscriptionPlan | null }
type ProfileWithAssets = Profile & { assets_uploaded?: number }


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ProfileWithAssets | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar_url: '',
  })

  const fetchData = async () => {
    try {
      
      if(!user) {
        setLoading(false)
        return
      }

    

      setFormData({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      })

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileData) {
        const { count: assetCount } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('contributor_id', user.id)

        setProfile({
            ...profileData,
            assets_uploaded: assetCount ?? 0
          })
        setFormData((prev) => ({
          ...prev,
          avatar_url: profileData.avatar_url || prev.avatar_url,
        }))
      }

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setSubscription(subData)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  

  const handleSave = async () => {
    try {
      // Update auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          avatar_url: formData.avatar_url,
        },
      })

      if (updateError) throw updateError

      // Update profile
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: formData.name,
            avatar_url: formData.avatar_url,
            updated_at: new Date().toISOString(),
          })

        if (profileError) throw profileError
      }

      setEditing(false)
      await fetchData()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900  mb-6 sm:mb-8">Profile & Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white  rounded-2xl shadow-lg p-6 border border-gray-200 ">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 ">
                    Profile Information
                  </h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-blue-600  hover:text-blue-700 "
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700  mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700  mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-gray-100  text-gray-500  cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500  mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700  mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900 "
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          fetchData()
                        }}
                        className="px-6 py-2 bg-gray-200  text-gray-900  rounded-lg font-semibold hover:bg-gray-300  transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {formData.avatar_url ? (
                        <img
                          src={formData.avatar_url}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-header flex items-center justify-center text-white text-2xl font-bold">
                          {formData.name?.[0]?.toUpperCase() || formData.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 ">
                          {formData.name || 'User'}
                        </h3>
                        <p className="text-gray-600 ">{formData.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Card */}
              <div className="bg-white  rounded-2xl shadow-lg p-6 border border-gray-200 ">
                <h2 className="text-2xl font-bold text-gray-900  mb-4">
                  Subscription
                </h2>
                {subscription ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 ">Current Plan</p>
                      <p className="text-xl font-bold text-gray-900 ">
                        {subscription.subscription_plans?.name || 'Active Plan'}
                      </p>
                    </div>
                    {false && (
                      <div className="p-3 bg-green-50  rounded-lg">
                        <p className="text-sm text-green-800 ">
                          ✓ First-month discount applied
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Upgrade Plan
                      </button>
                      <button className="px-4 py-2 bg-gray-200  text-gray-900  rounded-lg hover:bg-gray-300  transition-colors">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600  mb-4">No active subscription</p>
                    <a
                      href="/pricing"
                      className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                    >
                      View Plans
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contributor Status */}
              {profile && (
                <div className="bg-white  rounded-2xl shadow-lg p-6 border border-gray-200 ">
                  <h3 className="text-lg font-bold text-gray-900  mb-4">
                    Contributor Status
                  </h3>
                  {(profile.role === 'contributor' && profile.contributor_tier) || profile.role === 'admin' ? (
                    <div className="space-y-3">
                      <LevelBadge level={profile.contributor_tier || 'bronze'} size="md" />
                      <p className="text-sm text-gray-600 ">
                        Total Earnings: <strong>{(profile?.lifetime_earnings_cents ?? 0) / 100}</strong>
                      </p>
                      <p className="text-sm text-gray-600 ">
                        Assets Uploaded: <strong>{profile?.assets_uploaded ?? 0}</strong>
                      </p>
                      <a
                        href="/contributor/dashboard"
                        className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600  mb-3">
                        Status: <span className="font-semibold capitalize">{profile.role || 'Not Applied'}</span>
                      </p>
                      <a
                        href="/become-contributor"
                        className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Become a Contributor
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white  rounded-2xl shadow-lg p-6 border border-gray-200 ">
                <h3 className="text-lg font-bold text-gray-900  mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {profile?.role === 'approved' && (
                    <>
                      <a
                        href="/contributor/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100  rounded-lg transition-colors"
                      >
                        Contributor Dashboard
                      </a>
                      <a
                        href="/contributor/upload"
                        className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100  rounded-lg transition-colors"
                      >
                        Upload Asset
                      </a>
                    </>
                  )}
                  <a
                    href="/browse"
                    className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100  rounded-lg transition-colors"
                  >
                    Browse Assets
                  </a>
                  <a
                    href="/favorites"
                    className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100  rounded-lg transition-colors"
                  >
                    My Favorites
                  </a>
                  <a
                    href="/help"
                    className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100  rounded-lg transition-colors"
                  >
                    Help Center
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

