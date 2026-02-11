import { Component, computed, input } from '@angular/core';

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

  altIcon = computed(() => `${this.name()} icon`);

  tooltipText = computed(() => {
    const name = this.name();
    const key = this.keybind();
    return key ? `${name} (${key})` : name;
  });
}
