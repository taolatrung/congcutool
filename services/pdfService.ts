import { PDFDocument } from 'pdf-lib';

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
    try {
        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Load the source PDF
            const pdf = await PDFDocument.load(arrayBuffer);
            
            // Copy all pages from the source PDF
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            // Add copied pages to the merged PDF
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await mergedPdf.save();
        return pdfBytes;
    } catch (error) {
        console.error("Error merging PDFs:", error);
        throw new Error("Không thể ghép file. Vui lòng đảm bảo các file PDF không bị hỏng hoặc có mật khẩu.");
    }
};