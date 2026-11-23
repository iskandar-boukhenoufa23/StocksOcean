-- Local development sample assets. This file is loaded by `supabase db reset`.
-- The nullable contributor_id keeps the seed independent of local auth users.
INSERT INTO public.assets (
    id,
    contributor_id,
    title,
    description,
    type,
    storage_path,
    preview_path,
    price,
    license,
    status,
    tags,
    views,
    downloads,
    created_at,
    updated_at
)
VALUES
    ('10000000-0000-4000-8000-000000000001', NULL, 'Abstract Color Study', 'Layered color and geometric forms for editorial and presentation work.', 'image', 'seed/abstract-color-study.jpg', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80', 9.99, 'standard', 'approved', ARRAY['abstract', 'color', 'background'], 125, 23, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('10000000-0000-4000-8000-000000000002', NULL, 'Quiet Workspace', 'A bright, minimal workspace with natural light and clean lines.', 'image', 'seed/quiet-workspace.jpg', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 12.99, 'standard', 'approved', ARRAY['office', 'workspace', 'business'], 89, 15, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    ('10000000-0000-4000-8000-000000000003', NULL, 'Mountain at Golden Hour', 'Mountain peaks and a warm evening sky for travel and outdoor projects.', 'image', 'seed/mountain-golden-hour.jpg', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 15.99, 'standard', 'approved', ARRAY['mountain', 'landscape', 'nature'], 203, 42, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('10000000-0000-4000-8000-000000000004', NULL, 'Analytics Interface', 'A modern analytics dashboard displayed on a laptop.', 'image', 'seed/analytics-interface.jpg', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 19.99, 'standard', 'approved', ARRAY['technology', 'interface', 'dashboard'], 156, 28, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('10000000-0000-4000-8000-000000000005', NULL, 'City After Dark', 'An illuminated city skyline for urban and travel-themed designs.', 'image', 'seed/city-after-dark.jpg', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', 14.99, 'standard', 'approved', ARRAY['city', 'night', 'architecture'], 178, 31, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('10000000-0000-4000-8000-000000000006', NULL, 'Coffee and Morning Light', 'A coffee cup on a table in soft morning light.', 'image', 'seed/coffee-morning.jpg', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80', 8.99, 'standard', 'approved', ARRAY['coffee', 'food', 'lifestyle'], 142, 25, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('10000000-0000-4000-8000-000000000007', NULL, 'Tropical Shoreline', 'Clear water and a quiet shoreline for summer and travel projects.', 'image', 'seed/tropical-shoreline.jpg', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 16.99, 'standard', 'approved', ARRAY['beach', 'ocean', 'travel'], 267, 51, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    ('10000000-0000-4000-8000-000000000008', NULL, 'Flowing Motion Study', 'A vivid abstract composition suitable for motion design previews.', 'video', 'seed/flowing-motion.mp4', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', 24.99, 'standard', 'approved', ARRAY['motion', 'abstract', 'video'], 67, 12, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    ('10000000-0000-4000-8000-000000000009', NULL, 'Forest Canopy', 'A dense green forest scene for environmental and outdoor content.', 'video', 'seed/forest-canopy.mp4', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', 29.99, 'standard', 'approved', ARRAY['forest', 'nature', 'video'], 94, 18, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
    ('10000000-0000-4000-8000-000000000010', NULL, 'Modern Lounge Chair', 'A contemporary chair reference for furniture and interior design.', '3d', 'seed/modern-lounge-chair.glb', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80', 34.99, 'standard', 'approved', ARRAY['3d', 'furniture', 'interior'], 45, 8, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;