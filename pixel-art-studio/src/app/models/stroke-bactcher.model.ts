import Action from '../types/action';
import HistoryManager from './history-manager.model';

export class StrokeBatcher {
  private actions: Action[] = [];

  start(): void {
    this.actions = [];
  }

  add(action: Action): void {
    this.actions.push(action);
  }

  commit(historyManager: HistoryManager): boolean {
    if (this.actions.length === 0) return false;

    const actions = [...this.actions];
    const batchAction: Action = {
      type: 'PAINT_STROKE',
      undo: () => {
        for (let actionIndex = actions.length - 1; actionIndex >= 0; actionIndex--) {
          actions[actionIndex].undo();
        }
      },
      redo: () => {
        for (const act of actions) {
          act.redo();
        }
      },
    };

    historyManager.execute(batchAction);
    return true;
  }

  clear(): void {
    this.actions = [];
  }
}
