import Action from '../types/Action';

class HistoryManager {
  private undoStack: any[] = [];
  private redoStack: any[] = [];

  do(action: Action): void {
    this.undoStack.push(action);
    this.redoStack.length = 0; // Clear redo stack for consistency
  }

  undo(): void {
    if (this.undoStack.length > 0) {
      const action: Action = this.undoStack.pop()!;
      // Undo action
      this.redoStack.push(action);
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      const action: Action = this.redoStack.pop()!;
      // Redo action
      this.undoStack.push(action);
    }
  }
}

export default HistoryManager;
