import Action from '../types/Action';

export class HistoryManager {
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
  private readonly maxHistorySize = 75;

  constructor() {}

  execute(action: Action): void {
    if (this.undoStack.length >= this.maxHistorySize) {
      this.undoStack.shift();
    }
    this.undoStack.push(action);
    this.redoStack = []; // Clear redo stack for consistency
  }

  undo(): void {
    if (this.undoStack.length > 0) {
      const action: Action = this.undoStack.pop()!;
      action.undo();
      this.redoStack.push(action);
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      const action: Action = this.redoStack.pop()!;
      action.redo();
      this.undoStack.push(action);
    }
  }
}

export default HistoryManager;
