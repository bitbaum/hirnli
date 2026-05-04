/** Collect an async-iterable stream (from @react-pdf/renderer) into a Uint8Array safe for BodyInit */
export async function streamToBuffer(stream: AsyncIterable<Uint8Array | string>): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return new Uint8Array(Buffer.concat(chunks));
}

/** Sanitize a foundation name for use in a PDF filename */
export function sanitizeFoundationFilename(name: string): string {
  return name
    .replace(/[^a-zäöü0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
