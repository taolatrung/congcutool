import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const performOCR = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        text: "Extract all text from this image. Format it cleanly. If it is a document, preserve the structure as much as possible. Only output the extracted text."
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }
        });

        return response.text || "Không thể trích xuất văn bản.";
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Lỗi khi xử lý hình ảnh với AI.");
    }
};

export const generateSmartRename = async (textContext: string): Promise<string> => {
     try {
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model: model,
            contents: `Suggest a short, descriptive filename (without extension) based on this text content. Max 5 words, kebab-case: ${textContext.substring(0, 500)}`
        });
        return response.text?.trim() || "document-processed";
    } catch (error) {
        return "document-processed";
    }
}