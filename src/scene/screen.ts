/** Screen-space access to the 3D scene for DOM overlays (demo hand, e2e). Set by <Stage/>. */
export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}
export const screenApi: { project: ((propId: string) => ScreenPoint | null) | null } = { project: null };
