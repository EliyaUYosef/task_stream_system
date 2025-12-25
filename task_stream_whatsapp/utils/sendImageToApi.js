import { downloadMediaMessage } from "@whiskeysockets/baileys";
import axios from "axios";
import FormData from "form-data";
import "dotenv/config";
import { Jimp } from "jimp";

export async function sendMediaToBackend({
  message,
  sock,
  phone,
  mediaDetails,
}) {
  try {
    const buffer = await downloadMediaMessage(
      message,
      "buffer",
      {},
      { logger: console, reuploadRequest: sock.ev }
    );

    const mimeType =
      mediaDetails?.source?.mimeType || "application/octet-stream";

    let convertedBuffer = buffer;
    let fileExtension = "bin";

    if (mimeType.startsWith("audio/")) {
      // אודיו – לא נוגעים בבאפר
      fileExtension = mimeType.split("/")[1] || "ogg";
    } else {
      fileExtension = mimeType.split("/")[1] || "bin";
    }

    const fileName = `task_${phone}_${
      message.key?.id
    }_${Date.now()}.${fileExtension}`;

    if (process.env.SAVE_FILE === "true") {
      const fs = await import("fs");
      const path = await import("path");

      const dir = "./downloads";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const fullPath = path.join(dir, fileName);
      fs.writeFileSync(fullPath, convertedBuffer);

      const emoji = mediaDetails.type === "text" ? "📝" : "🎧";

      console.log(`${emoji} Saved media locally at`, fullPath);
    }

    const form = new FormData();

    form.append("file", convertedBuffer, fileName);
    form.append("phone", phone);
    form.append("isVoiceNote", String(!!mediaDetails?.source?.isVoiceNote));
    form.append("message_what_id", message.key?.id || "");
    form.append("timestamp", String(message.messageTimestamp || ""));
    form.append("user_name", message.pushName || "");

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3100";

    const response = await axios.post(`${backendUrl}/upload`, form, {
      headers: form.getHeaders(),
    });

    console.log("📨 Pass !");

    return (
      "כותרת : " +
        response.data?.parsed_task?.title +
        "\nתיאור :" +
        response.data?.parsed_task?.description +
        "\n" +
        "link: " +
        response.data?.client_link || "Media sent successfully"
    );
  } catch (error) {
    console.error("❌ Failed to send media to API:", error);
  }
}

export function chooseTreatmentType(message) {
  const msg = message.message;
  if (!msg) return null;

  // AUDIO / VOICE NOTE
  if (msg.audioMessage) {
    return {
      type: "media",
      source: {
        mediaMessage: msg.audioMessage,
        mimeType: msg.audioMessage.mimetype || "audio/ogg",
        isVoiceNote: !!msg.audioMessage.ptt, // true אם זו הודעה קולית
      },
    };
  }

  // 🎧 AUDIO AS DOCUMENT (opus / ogg שנשלח כקובץ)
  if (
    msg.documentMessage &&
    msg.documentMessage.mimetype?.startsWith("audio/")
  ) {
    return {
      type: "media",
      source: {
        mediaMessage: msg.documentMessage,
        mimeType: msg.documentMessage.mimetype,
        isVoiceNote: false, // זה קובץ, לא PTT
      },
    };
  }

  // TEXT / URL
  const textContent = msg.conversation || msg.extendedTextMessage?.text || "";

  if (textContent) {
    return {
      type: "text",
      source: textContent,
    };
  }

  // OTHER
  console.error("❓ Unknown message type:", msg);
  return null;
}
