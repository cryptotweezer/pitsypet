// Minimal ambient types for pdf-parse's internal entry point. We import the
// /lib path directly to skip the package's debug wrapper (which tries to read a
// bundled sample PDF on import).
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    info: unknown;
    metadata: unknown;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
