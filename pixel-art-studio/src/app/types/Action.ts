type Action = {
  type: string;
  x?: number;
  y?: number;
  oldColor?: string;
  newColor?: string;
  layerId?: string;
  undo: () => void;
  redo: () => void;
};

export default Action;
