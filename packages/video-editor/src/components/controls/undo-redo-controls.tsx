import { Undo2, Redo2 } from "lucide-react";

type UndoRedoControlsProps = {
  canUndo: boolean; 
  canRedo: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}
export const UndoRedoControls = ({ canUndo, canRedo, onUndo, onRedo }: UndoRedoControlsProps) => {

  return (
    <div className="undo-redo-controls">
      <button
        className={`control-btn${canUndo ? " active" : " btn-disabled"}`}
        onClick={onUndo}
        aria-label="撤销"
      >
        <Undo2 size={18} strokeWidth={2} />
      </button>

      <button
        onClick={onRedo}
        aria-label="重做"
        className={`control-btn${canRedo ? " active" : " btn-disabled"}`}
      >
        <Redo2 size={18} strokeWidth={2} />
      </button>
    </div>
  );
};
