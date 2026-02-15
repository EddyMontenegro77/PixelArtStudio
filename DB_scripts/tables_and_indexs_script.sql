CREATE TABLE IF NOT EXISTS app_user (
	user_id BIGSERIAL PRIMARY KEY,
	username varchar(50) NOT NULL,
	password_hash TEXT NOT NULL,
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_project (
	project_id BIGSERIAL PRIMARY KEY,
	project_name varchar(50) NOT NULL,
	width int NOT NULL,
	height int NOT NULL,
	active_frame_id int NOT NULL,
	thumbnail_url TEXT,
	project_data JSONB NOT NULL,
	user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_project_user_updated
ON user_project(user_id, updated_at DESC);