import { create } from 'zustand';

interface UiState {
  termCard: string | null;
  openTerm: (id: string | null) => void;
  /** last inspect hotspot tapped (shown in the HUD) */
  inspectFocus: string | null;
  setInspectFocus: (id: string | null) => void;
  /** screen area covered by the HUD panel (px), used to recenter the 3D view */
  panelInset: { right: number; bottom: number };
  /** "Show me how" demo: incrementing token while playing, null when idle */
  demo: number | null;
  setDemo: (d: number | null) => void;
  setPanelInset: (v: { right: number; bottom: number }) => void;
}

export const useUi = create<UiState>()((set) => ({
  termCard: null,
  openTerm: (termCard) => set({ termCard }),
  inspectFocus: null,
  setInspectFocus: (inspectFocus) => set({ inspectFocus }),
  panelInset: { right: 0, bottom: 0 },
  demo: null,
  setDemo: (demo) => set({ demo }),
  setPanelInset: (panelInset) => set({ panelInset }),
}));
