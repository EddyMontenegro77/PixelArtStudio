declare module 'gifenc' {
  export type GifPalette = number[][];

  export type GifFrameOptions = {
    palette: GifPalette;
    delay?: number;
  };

  export interface GifEncoderInstance {
    writeFrame(
      index: Uint8Array | Uint16Array,
      width: number,
      height: number,
      options: GifFrameOptions,
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }

  export function GIFEncoder(): GifEncoderInstance;

  // Reduces image colors to a limited palette
  export function quantize(rgba: Uint8Array, maxColors: number): GifPalette;

  // Converts RGB pixels to palette indexs
  export function applyPalette(
    rgba: Uint8Array,
    palette: GifPalette,
    format?: 'rgb444' | 'rgb565' | 'rgb',
  ): Uint8Array | Uint16Array;
}

declare module 'upng-js' {
  type UPNGModule = {
    encode(
      buffers: ArrayBuffer[],
      width: number,
      height: number,
      cnum?: number,
      delays?: number[],
    ): ArrayBuffer;
  };

  const UPNG: UPNGModule;
  export default UPNG;
}
