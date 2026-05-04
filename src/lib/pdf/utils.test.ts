import { describe, it, expect } from 'vitest';
import { sanitizeFoundationFilename, streamToBuffer } from './utils';

describe('sanitizeFoundationFilename', () => {
  it('lowercases ASCII names', () => {
    expect(sanitizeFoundationFilename('Max Mustermann')).toBe('max-mustermann');
  });

  it('preserves Swiss umlauts', () => {
    expect(sanitizeFoundationFilename('Schüler-Stiftung')).toBe('schüler-stiftung');
    expect(sanitizeFoundationFilename('Förderverein Zürich')).toBe('förderverein-zürich');
    expect(sanitizeFoundationFilename('Stiftung Ökotech')).toBe('stiftung-ökotech');
  });

  it('replaces non-alphanumeric, non-umlaut chars with dashes', () => {
    expect(sanitizeFoundationFilename('ABC & DEF')).toBe('abc-def');
    expect(sanitizeFoundationFilename("Mayer's Foundation")).toBe('mayer-s-foundation');
  });

  it('collapses multiple consecutive dashes', () => {
    expect(sanitizeFoundationFilename('A  B  C')).toBe('a-b-c');
    expect(sanitizeFoundationFilename('X -- Y')).toBe('x-y');
  });

  it('strips leading and trailing dashes', () => {
    expect(sanitizeFoundationFilename('!Test!')).toBe('test');
    expect(sanitizeFoundationFilename('-Leading')).toBe('leading');
    expect(sanitizeFoundationFilename('Trailing-')).toBe('trailing');
  });

  it('preserves digits', () => {
    expect(sanitizeFoundationFilename('Stiftung21')).toBe('stiftung21');
    expect(sanitizeFoundationFilename('123 Foundation')).toBe('123-foundation');
  });

  it('handles already-clean input unchanged', () => {
    expect(sanitizeFoundationFilename('clean-name')).toBe('clean-name');
  });
});

describe('streamToBuffer', () => {
  async function* makeStream(chunks: (string | Uint8Array)[]): AsyncIterable<string | Uint8Array> {
    for (const chunk of chunks) yield chunk;
  }

  it('collects string chunks into a Uint8Array', async () => {
    const result = await streamToBuffer(makeStream(['hello', ' ', 'world']));
    expect(Buffer.from(result).toString('utf8')).toBe('hello world');
  });

  it('collects Uint8Array chunks', async () => {
    const a = new Uint8Array([72, 105]);
    const b = new Uint8Array([33]);
    const result = await streamToBuffer(makeStream([a, b]));
    expect(Buffer.from(result).toString('utf8')).toBe('Hi!');
  });

  it('returns an empty Uint8Array for an empty stream', async () => {
    const result = await streamToBuffer(makeStream([]));
    expect(result.length).toBe(0);
  });

  it('result satisfies BodyInit (is Uint8Array<ArrayBuffer>)', async () => {
    const result = await streamToBuffer(makeStream(['test']));
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.buffer).toBeInstanceOf(ArrayBuffer);
  });
});
