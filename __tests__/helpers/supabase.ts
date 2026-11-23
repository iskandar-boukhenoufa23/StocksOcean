import { jest } from '@jest/globals'

export interface MockAsset {
  id: string
  title: string
  contributor_id: string | null
  status: string
  type?: string
  price?: number
  preview_path?: string | null
  storage_path?: string | null
}

export interface MockProfile {
  id: string
  username: string | null
  avatar_url?: string | null
  role?: string | null
}

export interface CreateSupabaseMockOptions {
  asset?: MockAsset | null
  profile?: MockProfile | null
  fetchError?: { message: string } | null
  updateError?: { message: string } | null
  userEmail?: string | null
}

export function createSupabaseMock(
  options: CreateSupabaseMockOptions = {},
) {
  const {
    asset = null,
    profile = null,
    fetchError = null,
    updateError = null,
    userEmail = null,
  } = options

  // ------------------------------------
  // assets
  // ------------------------------------

  const assetMaybeSingle = jest.fn().mockResolvedValue({
    data: asset,
    error: fetchError,
  })

  const assetEq = jest.fn().mockReturnValue({
    maybeSingle: assetMaybeSingle,
  })

  const assetSelect = jest.fn().mockReturnValue({
    eq: assetEq,
  })

  const assetUpdateEq = jest.fn().mockResolvedValue({
    data: null,
    error: updateError,
  })

  const assetUpdate = jest.fn().mockReturnValue({
    eq: assetUpdateEq,
  })

  // ------------------------------------
  // profiles
  // ------------------------------------

  const profileMaybeSingle = jest.fn().mockResolvedValue({
    data: profile,
    error: null,
  })

  const profileEq = jest.fn().mockReturnValue({
    maybeSingle: profileMaybeSingle,
  })

  const profileSelect = jest.fn().mockReturnValue({
    eq: profileEq,
  })

  // ------------------------------------
  // notifications
  // ------------------------------------

  const notificationInsert = jest.fn().mockResolvedValue({
    data: null,
    error: null,
  })

  // ------------------------------------
  // auth.admin
  // ------------------------------------

  const getUserById = jest.fn().mockResolvedValue({
    data: userEmail
      ? {
          user: {
            id: asset?.contributor_id ?? '',
            email: userEmail,
          },
        }
      : {
          user: null,
        },
  })

  // ------------------------------------
  // Supabase client
  // ------------------------------------

  const supabase = {
    from: jest.fn((table: string) => {
      switch (table) {
        case 'assets':
          return {
            select: assetSelect,
            update: assetUpdate,
          }

        case 'profiles':
          return {
            select: profileSelect,
          }

        case 'notifications':
          return {
            insert: notificationInsert,
          }

        default:
          throw new Error(
            `Unexpected table requested: ${table}`,
          )
      }
    }),

    auth: {
      admin: {
        getUserById,
      },
    },
  }

  return {
    supabase,

    assets: {
      select: assetSelect,
      eq: assetEq,
      maybeSingle: assetMaybeSingle,
      update: assetUpdate,
      updateEq: assetUpdateEq,
    },

    profiles: {
      select: profileSelect,
      eq: profileEq,
      maybeSingle: profileMaybeSingle,
    },

    notifications: {
      insert: notificationInsert,
    },

    auth: {
      getUserById,
    },
  }
}