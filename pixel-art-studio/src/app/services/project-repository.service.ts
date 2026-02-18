import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase.service';
import { PersistedProjectSaveData } from '../types/projectsave/project-save';
import { AuthService } from './auth.service';

type CloudProjectRow = {
  project_id: string;
  user_id: string;
  project_name: string;
  width: number;
  height: number;
  active_frame_id: number;
  thumbnail_path: string | null;
  project_data: PersistedProjectSaveData;
  created_at: string;
  updated_at: string;
};

export type ProjectListItem = {
  projectId: string;
  name: string;
  width: number;
  height: number;
  activeFrameId: number;
  thumbnailPath: string | null;
  updatedAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectRepositoryService {
  private readonly USER_PROJECT_TABLE = 'user_project';
  private readonly THUMBNAIL_BUCKET = 'PixelArtStudio-project-thumbnails' as const;

  constructor(
    private storageService: StorageService,
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {}

  async insertProjectInCloud(projectData: PersistedProjectSaveData): Promise<string> {
    const userId = this.getRequiredUserId();

    const { data, error } = await this.supabaseService.supabase
      .from(this.USER_PROJECT_TABLE)
      .insert({
        user_id: userId,
        project_name: projectData.name,
        width: projectData.width,
        height: projectData.height,
        active_frame_id: projectData.activeFrameId,
        project_data: projectData,
      })
      .select('project_id')
      .single();

    if (error) throw error;
    return data.project_id as string;
  }

  async updateProjectInCloud(
    projectId: string,
    projectData: PersistedProjectSaveData,
    thumbnailPath?: string | null,
  ): Promise<void> {
    const userId = this.getRequiredUserId();

    const payload: Partial<CloudProjectRow> = {
      project_name: projectData.name,
      width: projectData.width,
      height: projectData.height,
      active_frame_id: projectData.activeFrameId,
      project_data: projectData,
    };

    if (thumbnailPath !== undefined) {
      payload.thumbnail_path = thumbnailPath;
    }

    const { error } = await this.supabaseService.supabase
      .from(this.USER_PROJECT_TABLE)
      .update(payload)
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async saveProjectInCloud(
    projectData: PersistedProjectSaveData,
    existingProjectId?: string,
    thumbnailBlob?: Blob,
  ): Promise<string> {
    const userId = this.getRequiredUserId();

    if (!existingProjectId) {
      const newId = await this.insertProjectInCloud(projectData);
      if (thumbnailBlob) {
        const thumbnailPath = await this.uploadThumbnail(userId, newId, thumbnailBlob);
        await this.updateProjectInCloud(newId, projectData, thumbnailPath);
      }
      return newId;
    }

    let thumbnailPath: string | null | undefined = undefined;
    if (thumbnailBlob) {
      thumbnailPath = await this.uploadThumbnail(userId, existingProjectId, thumbnailBlob);
    }

    await this.updateProjectInCloud(existingProjectId, projectData, thumbnailPath);
    return existingProjectId;
  }

  async getProjectFromCloud(projectId: string): Promise<PersistedProjectSaveData> {
    const userId = this.getRequiredUserId();

    const { data, error } = await this.supabaseService.supabase
      .from(this.USER_PROJECT_TABLE)
      .select('project_data')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (error) throw error;
    return data.project_data as PersistedProjectSaveData;
  }

  async listProjectsFromCloud(): Promise<ProjectListItem[]> {
    const userId = this.getRequiredUserId();

    const { data, error } = await this.supabaseService.supabase
      .from(this.USER_PROJECT_TABLE)
      .select('project_id, project_name, width, height, active_frame_id, thumbnail_path, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data as Array<Pick<CloudProjectRow, 'project_id' | 'project_name' | 'width' | 'height' | 'active_frame_id' | 'thumbnail_path' | 'updated_at'>>).map((row) => ({
      projectId: row.project_id,
      name: row.project_name,
      width: row.width,
      height: row.height,
      activeFrameId: row.active_frame_id,
      thumbnailPath: row.thumbnail_path,
      updatedAt: row.updated_at,
    }));
  }

  async deleteProjectFromCloud(projectId: string): Promise<void> {
    const userId = this.getRequiredUserId();

    const { data: row, error: selectError } = await this.supabaseService.supabase
      .from(this.USER_PROJECT_TABLE)
      .select('thumbnail_path')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) throw selectError;

    const { error } = await this.supabaseService.supabase
      .from(this.USER_PROJECT_TABLE)
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;

    const thumbnailPath = row?.thumbnail_path as string | null | undefined;
    if (thumbnailPath) {
      await this.storageService.removeObject(this.THUMBNAIL_BUCKET, thumbnailPath);
    }
  }

  async getThumbnailUrl(thumbnailPath: string, expiresIn = 3600): Promise<string | null> {
    const result = await this.storageService.getSignedUrl(
      this.THUMBNAIL_BUCKET,
      thumbnailPath,
      expiresIn,
    );

    if (!result.success) return null;
    return result.url;
  }

  private getRequiredUserId(): string {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No active session.');
    return user.id;
  }

  private async uploadThumbnail(userId: string, projectId: string, blob: Blob): Promise<string> {
    const uploadResult = await this.storageService.uploadProjectThumbnail({
      userId,
      projectId,
      blob,
    });

    if (!uploadResult.success) {
      throw uploadResult.error;
    }

    return uploadResult.path;
  }
}
