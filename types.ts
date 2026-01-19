
export interface AudioAnalysis {
  volume: number;      // 0 to 1
  beat: boolean;        // Triggered jump
  pitch: number;       // Average dominant frequency (0 to 1 normalized)
  timbre: number;      // Spectral flatness or high-freq ratio (0 to 1)
  rawFft: Uint8Array;
}

export enum SkyState {
  MORNING = 'MORNING',
  DAY = 'DAY',
  EVENING = 'EVENING',
  DREAM = 'DREAM'
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export const SKY_COLORS: Record<SkyState, { top: HSL; main: HSL; horizon: HSL; core: HSL }> = {
  [SkyState.MORNING]: { 
    top: { h: 215, s: 30, l: 88 },
    main: { h: 210, s: 35, l: 96 }, 
    horizon: { h: 195, s: 50, l: 98 },
    core: { h: 190, s: 40, l: 100 }
  },
  [SkyState.DAY]: { 
    top: { h: 205, s: 85, l: 82 },
    main: { h: 200, s: 75, l: 92 }, 
    horizon: { h: 185, s: 90, l: 96 },
    core: { h: 180, s: 20, l: 100 }
  },
  [SkyState.EVENING]: { 
    top: { h: 265, s: 50, l: 75 },
    main: { h: 260, s: 45, l: 85 }, 
    horizon: { h: 345, s: 80, l: 90 },
    core: { h: 25, s: 95, l: 94 }
  },
  [SkyState.DREAM]: { 
    top: { h: 195, s: 60, l: 82 },
    main: { h: 185, s: 70, l: 92 }, 
    horizon: { h: 250, s: 55, l: 96 },
    core: { h: 170, s: 80, l: 98 }
  }
};

export const WATER_COLORS_BY_STATE: Record<SkyState, { far: HSL; mid: HSL; near: HSL }> = {
  [SkyState.MORNING]: { 
    far: { h: 215, s: 25, l: 94 }, 
    mid: { h: 210, s: 40, l: 90 }, 
    near: { h: 205, s: 60, l: 82 } 
  },
  [SkyState.DAY]: { 
    far: { h: 200, s: 60, l: 88 }, 
    mid: { h: 195, s: 85, l: 78 }, 
    near: { h: 190, s: 95, l: 65 } 
  },
  [SkyState.EVENING]: { 
    far: { h: 260, s: 40, l: 88 }, 
    mid: { h: 265, s: 60, l: 75 }, 
    near: { h: 285, s: 80, l: 60 } 
  },
  [SkyState.DREAM]: { 
    far: { h: 185, s: 50, l: 92 }, 
    mid: { h: 180, s: 75, l: 84 }, 
    near: { h: 175, s: 90, l: 72 } 
  }
};
