import { Component, computed, input } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-tool-item',
  imports: [],
  templateUrl: './tool-item.html',
  styleUrl: './tool-item.scss',
})
export class ToolItem {
  name = input.required<string>();
  keybind = input.required<string>();
  icon = input.required<string>();
  isActive = input<boolean>(false);

  constructor(private themeService: ThemeService) {}

  altIcon = computed(() => `${this.name()} icon`);
  resolvedIcon = computed(() => {
    const iconPath = this.icon().startsWith('/') ? this.icon() : `/${this.icon()}`;
    const suffix = this.themeService.theme() === 'dark' ? 'white' : 'black';
    return iconPath.replace(/_(black|white)\.svg$/, `_${suffix}.svg`);
  });

  tooltipText = computed(() => {
    const name = this.name();
    const key = this.keybind();
    return key ? `${name} (${key})` : name;
  });
}
