import { PencilTool } from './pencil-tool.model';
import { ToolContext } from '../../types/tool.interface';

export class EraserTool extends PencilTool {
  override name: string = 'Eraser';
  override icon: string = '/icons/eraser_icon_black.svg';

  protected override getPaintColor(_context: ToolContext): string {
    return 'transparent';
  }
}
