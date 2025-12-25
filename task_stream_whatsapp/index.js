import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import {
  sendMediaToBackend,
  chooseTreatmentType,
} from "./utils/sendImageToApi.js";
import { Browsers } from "@whiskeysockets/baileys";
import QRCode from "qrcode";

async function processMessage(message, sock) {
  try {
    // CHECK IF MESSAGE IS RELEVANT
    if (
      !message.key ||
      !message.message ||
      message.broadcast ||
      !!message.messageStubType ||
      message.key.remoteJid.endsWith("@g.us") ||
      message.key.remoteJid.endsWith("@newsletter") ||
      !!message.key?.fromMe
    )
      return null; // Ignore messages sent by the bot itself

    // FOR DEBUGGING
    if (+message.key.remoteJid?.split("@")[0] !== 972525676077) return null; // for debugging purposes, only process messages from this number

    const mediaDetails = chooseTreatmentType(message);
    if (!mediaDetails) {
      console.log(`📝 [WhatsApp Bot] Received unsupported message type.`);
      return null; // Ignore unsupported message types
    }
    console.log(
      `📝 [WhatsApp Bot] Processing message of type: ${mediaDetails.type}`
    );
    const our_message = await sendMediaToBackend({
      message,
      sock,
      phone: message.key.remoteJid.split("@")[0],
      mediaDetails,
    });

    await sock.sendMessage(
      message.key.remoteJid,
      { text: our_message || "תהליך הסתיים, נשלח עדכון בהמשך." },
      { quoted: message }
    );

    return our_message;
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

async function connectToWhatsApp() {
  console.log("\x1b[32m%s\x1b[0m", "starting connection");
  console.log("\x1b[32m%s\x1b[0m", "WITH MEEE !");

  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      "auth_info_baileys"
    );
    if (!state) {
      // TODO: ERROR HANDLING
      console.error("Failed to load authentication state");
      return;
    }

    const sock = makeWASocket({
      auth: state,
      // printQRInTerminal: true,
      browser: Browsers.macOS("Chrome"),
    });

    if (!sock) {
      // TODO: ERROR HANDLING
      console.error("Failed to create WhatsApp socket");
      return;
    }
    // Handle connection updates
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr: qrData } = update;

      // QR CODE
      if (qrData) {
        const qrString = await QRCode.toString(qrData, { type: "terminal" });
        console.log(qrString);
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log("closed connection, reconnecting:", shouldReconnect);
        if (shouldReconnect) connectToWhatsApp();
        else {
          // TODO: ERROR HANDLING
          console.error("Logged out from WhatsApp. Please re-authenticate.");
        }
      }

      if (connection === "open") {
        console.log("Waiting for updates...");
      }
    });

    // Handle incoming messages
    sock.ev.on("messages.upsert", async (m) => {
      console.log("\x1b[32m%s\x1b[0m", "START OF NEW MESSAGE");
      for (const message of m.messages) {
        await processMessage(message, sock); // Call the extracted function to handle each message
      }
    });
    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    console.error("Error in connectToWhatsApp:", error);
  }
}

connectToWhatsApp();
