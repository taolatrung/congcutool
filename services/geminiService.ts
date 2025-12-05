import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- UTILS FOR AUDIO ---
function base64ToFloat32Array(base64: string): Float32Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // Convert Uint8Array (raw bytes) to Int16Array then to Float32
    // Note: The API returns raw PCM 16-bit usually, but let's assume standard handling
    // Actually, checking docs: It returns raw PCM. Let's wrap it in WAV container.
    return new Float32Array(bytes.buffer);
}

function createWavHeader(sampleRate: number, numChannels: number, dataLength: number) {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

const base64ToWavBlob = (base64Data: string, sampleRate = 24000): Blob => {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = createWavHeader(sampleRate, 1, len);
    return new Blob([wavHeader, bytes], { type: 'audio/wav' });
};

// --- API FUNCTIONS ---

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

export const generateAIContent = async (
    topic: string, 
    type: string, 
    tone: string, 
    language: string
): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        
        // Construct a prompt based on user inputs
        const prompt = `
            Act as a professional copywriter. Write a ${type} about the following topic: "${topic}".
            
            Configuration:
            - Tone: ${tone}
            - Language: ${language}
            
            Requirements:
            - Use clear, engaging, and grammatically correct language.
            - Format the output nicely with headings or bullet points if appropriate for the content type.
            - Do not include conversational filler like "Here is your content". Just output the content directly.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        return response.text || "Không thể tạo nội dung. Vui lòng thử lại.";
    } catch (error) {
        console.error("AI Writer Error:", error);
        throw new Error("Lỗi kết nối đến AI Server.");
    }
};

export const generateSummary = async (
    text: string,
    length: 'short' | 'medium' | 'long',
    format: 'paragraph' | 'bullets'
): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        
        let lengthInstruction = "";
        switch (length) {
            case 'short': lengthInstruction = "Very concise, 1-2 sentences."; break;
            case 'medium': lengthInstruction = "Standard summary, capturing key points."; break;
            case 'long': lengthInstruction = "Detailed summary, covering all main ideas."; break;
        }

        let formatInstruction = "";
        switch (format) {
            case 'paragraph': formatInstruction = "Write as a coherent paragraph."; break;
            case 'bullets': formatInstruction = "Use bullet points for key takeaways."; break;
        }

        const prompt = `
            Summarize the following text.
            
            Configuration:
            - Length: ${lengthInstruction}
            - Format: ${formatInstruction}
            - Language: Detect the language of the input text and write the summary in the SAME language.
            
            Input Text:
            "${text}"
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        return response.text || "Không thể tóm tắt văn bản này.";
    } catch (error) {
        console.error("AI Summarizer Error:", error);
        throw new Error("Lỗi kết nối đến AI Server.");
    }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        text: "Transcribe the following audio file into text. Detect the language automatically. Provide a clean, accurate transcription. Identify speakers if possible (Speaker 1, Speaker 2)."
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    }
                ]
            }
        });

        return response.text || "Không thể chuyển đổi âm thanh.";
    } catch (error) {
        console.error("Transcription Error:", error);
        throw new Error("Lỗi khi xử lý âm thanh với AI. Vui lòng kiểm tra định dạng hoặc dung lượng file.");
    }
};

export const generateSpeech = async (text: string, voiceName: string): Promise<Blob> => {
    try {
        const model = 'gemini-2.5-flash-preview-tts';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [{ text: text }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned");
        }

        // Convert raw PCM base64 to a playable WAV Blob
        return base64ToWavBlob(base64Audio, 24000); 

    } catch (error) {
        console.error("TTS Error:", error);
        throw new Error("Lỗi khi tạo giọng đọc AI.");
    }
};