declare module "react-jigsaw" {
  import { FC } from "react";

  export interface InitialPuzzleOptions {
    board?: {
      className?: string;
      columns?: number;
      height?: number;
      outlineStrokeColor?: string;
      rows?: number;
      scatterArea?: number;
      showBoardSlotOutlines?: boolean;
      snapThreshold?: number;
      width?: number;
    };
    puzzle?: {
      className?: string;
      responsive?: boolean;
      timer?: { className?: string; enabled?: boolean };
      refreshButton?: { className?: string; enabled?: boolean };
      rowsAndColumns?: { className?: string; enabled?: boolean };
    };
    puzzlePiece?: {
      strokeColor?: string;
      strokeEnabled?: boolean;
    };
  }

  interface PuzzleProps {
    image: string;
    options?: InitialPuzzleOptions;
    onComplete?: () => void;
    onRefresh?: () => void;
    responsive?: boolean;
  }

  export const Puzzle: FC<PuzzleProps>;
  export const DEFAULT_PUZZLE_OPTIONS: InitialPuzzleOptions;
}

declare module "react-jigsaw/styles" {
  const styles: string;
  export default styles;
}
