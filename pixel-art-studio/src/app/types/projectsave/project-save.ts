import { PaletteSnapshot } from '../../models/palette.model';
import { ProjectSnapshot } from '../../models/project.model';
import { FrameSnapshot } from '../../models/frame.model';

export type PersistedLayer = {
  id: number;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  pixels: string[][];
};

export type PersistedFrame = {
  id: number;
  duration: number;
  activeLayerId: number;
  layers: PersistedLayer[];
};

export type PersistedProjectSaveData = {
  name: string;
  width: number;
  height: number;
  pixelSize: number;
  activeFrameId: number;
  palette: PaletteSnapshot;
  frames: PersistedFrame[];
};

export type ProjectState = {
  projectSnapshot: ProjectSnapshot;
  frameSnapshots: Map<number, FrameSnapshot>;
};
