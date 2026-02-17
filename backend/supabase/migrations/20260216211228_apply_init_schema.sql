CREATE TABLE IF NOT EXISTS public.user_profile(
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS public.user_project(
    project_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name text NOT NULL,
    width int NOT NULL,
    height int NOT NULL,
    active_frame_id int NOT NULL,
    thumbnail_path text,
    project_data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_project_user_updated
ON public.user_project(user_id, updated_at desc);