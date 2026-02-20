import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { ProjectCard } from '../../components/project-card/project-card';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../types/auth-interfaces/user';
import { ProjectListItem } from '../../services/project-repository.service';

type ProfileProject = ProjectListItem & { thumbnailUrl: string | null };

@Component({
  selector: 'app-profile',
  imports: [ProjectCard],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  readonly defaultAvatar = '/icons/user_icon_black.svg';
  readonly user = signal<User | null>(null);
  readonly projects = signal<ProfileProject[]>([]);
  readonly isLoadingProjects = signal<boolean>(true);
  readonly isEditingUsername = signal<boolean>(false);
  readonly usernameDraft = signal<string>('');
  readonly errorMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.user.set(user);
      if (user && !this.isEditingUsername()) {
        this.usernameDraft.set(user.name);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    this.errorMessage.set('');
    this.isLoadingProjects.set(true);
    try {
      const projects = await this.projectService.listCloudProjectsWithThumbnails();
      this.projects.set(projects);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not load projects.');
    } finally {
      this.isLoadingProjects.set(false);
    }
  }

  startEditUsername(): void {
    const user = this.user();
    this.usernameDraft.set(user?.name ?? '');
    this.isEditingUsername.set(true);
  }

  cancelEditUsername(): void {
    const user = this.user();
    this.usernameDraft.set(user?.name ?? '');
    this.isEditingUsername.set(false);
  }

  updateUsernameDraft(value: string): void {
    this.usernameDraft.set(value);
  }

  async saveUsername(): Promise<void> {
    const username = this.usernameDraft().trim();
    if (!username) {
      this.errorMessage.set('Username cannot be empty.');
      return;
    }

    try {
      await this.authService.updateUsername(username);
      this.isEditingUsername.set(false);
      this.errorMessage.set('');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not update username.');
    }
  }

  async handleAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      await this.authService.uploadAvatar(file);
      this.errorMessage.set('');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not upload avatar.');
    } finally {
      input.value = '';
    }
  }

  async handleOpenProject(projectId: string): Promise<void> {
    try {
      await this.projectService.loadProjectFromCloud(projectId);
      await this.router.navigate(['/editor']);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not open project.');
    }
  }

  async handleDeleteProject(projectId: string): Promise<void> {
    try {
      await this.projectService.deleteProjectFromCloud(projectId);
      this.projects.update((projects) => projects.filter((project) => project.projectId !== projectId));
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not delete project.');
    }
  }
}
