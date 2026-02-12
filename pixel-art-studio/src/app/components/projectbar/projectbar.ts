import { Component } from '@angular/core';
import { Layers } from './layers/layers';
import { Palettes } from './palettes/palettes';

@Component({
  selector: 'app-projectbar',
  imports: [Layers, Palettes],
  templateUrl: './projectbar.html',
  styleUrl: './projectbar.scss',
})
export class Projectbar {}
