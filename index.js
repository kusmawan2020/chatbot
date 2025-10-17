// import dependencies
//
import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
// SESSION 5 - import path/url package
import path from "node:path";
import { fileURLToPath } from "node:url";

// WIP: kita import dan langsung panggil function-nya
import "dotenv/config";

// inisialisasi aplikasi
//
// deklarasi variable di JavaScript
// [const|let] [namaVariable] = [value]
// [var] --> nggak boleh dipake lagi (fungsinya sudah digantikan oleh const/let di ES2015)
// [var] --> global declaration (var namaOrang)
//
// [const] --> 1x declare, nggak bisa diubah-ubah lagi
// [let]   --> 1x declare, tapi bisa diubah-ubah (re-assignment)
//
// tipe data: number, string, boolean (true/false), undefined
// special: null (tipe-nya object, tapi nilainya falsy)

const app = express();
const upload = multer(); // akan digunakan di dalam recording

const ai = new GoogleGenAI({}); // instantiation menjadi object instance (OOP -- Object-Oriented Programming)

// SESSION 5 - penambahan path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// inisialisasi middleware
// contoh: app.use(namaMiddleware());
app.use(cors()); // inisialisasi CORS (Cross-Origin Resource Sharing) sebagai middleware
app.use(express.json());

// SESSION 5 - inisialisasi static directory
app.use(
  // express.static(rootDirectory, options)
  express.static(
    path.join(__dirname, "static"), // rootDirectory
    // akan set route `/` sebagai static directory, dengan
    // folder "static" (atau nama yang kita set di atas) sebagai
    // direktori tujuan; tapi ketika ada route handler
    // yang di-set di bawahnya, route handler tersebut akan diutamakan
  ),
);

// inisialisasi routing
// contoh: app.get(), app.post(), app.put(), dll
// -- get/post/put itu bagian dari standar HTTP (Hypertext Transfer Protocol)
// HTTP Methods:
// GET, PUT, POST, PATCH, DELETE, OPTIONS, HEAD
//
// Functions (* --> yang digunakan di sesi kali ini)
//
// secara penulisannya
// function biasa --> function namaFunction() {}
// [*] arrow function --> [const namaFunction =] () => {}
//
// secara alurnya
// synchronous    --> () => {}
// [*] asynchronous   --> async () => {}
app.post("/generate-text", async (req, res) => {
  // terima jeroannya, lalu cek di sini
  const { prompt } = req.body; // object destructuring

  // debugging
  console.log({ prompt });

  // guard clause (kasarnya, satpam)
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({
      success: false,
      message: "Prompt harus berupa string!",
      data: null,
    });
    return;
  }

  // jeroannya
  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      // ini untuk config AI-nya lebih jauh lagi
      config: {
        systemInstruction:
          "Harus dibalas dalam bahasa Jepang atau Sunda secara acak.",
      },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil dijawab sama Gemini nih!",
      data: aiResponse.text,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Gagal gan, server-nya kayaknya lagi bermasalah!",
      data: null,
    });
  }
});

// fitur chat
// endpoint: POST /api/chat
app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    // satpam #1: Cek conversation apakah berupa array atau tidak
    //            dengan Array.isArray().
    if (!Array.isArray(conversation)) {
      throw new Error("Conversation harus berupa array!");
    }

    // satpam #2: Cek setiap pesan dalam conversation, apakah valid atau tidak
    let messageIsValid = true;

    if (conversation.length === 0) {
      throw new Error("Conversation tidak boleh kosong!");
    }

    conversation.forEach((message) => {
      // bisa tambah satu kondisi lagi untuk cek variable messageIsValid
      // di sini

      // Kondisi #1 -- message harus berupa object dan bukan `null`
      if (!message || typeof message !== "object") {
        messageIsValid = false;
        return;
      }

      const keys = Object.keys(message);
      const objectHasValidKeys = keys.every((key) =>
        ["text", "role"].includes(key),
      );

      // looping kondisi di dalam array
      // .every() --> &&-nya si if --> 1 false, semuanya false
      // .some()  --> ||-nya si if --> 1 true, semuanya menjadi true

      // Kondisi #2 -- message harus punya struktur yang valid
      if (keys.length !== 2 || !objectHasValidKeys) {
        messageIsValid = false;
        return;
      }

      const { text, role } = message;

      // Kondisi 3A -- role harus valid
      if (!["model", "user"].includes(role)) {
        messageIsValid = false;
        return;
      }

      // Kondisi 3B -- text harus valid
      if (!text || typeof text !== "string") {
        messageIsValid = false;
        return;
      }
    });

    if (!messageIsValid) {
      throw new Error("Message harus valid!");
    }

    // proses dagingnya

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: "Harus membalas dengan bahasa Sunda.",
      },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil dibalas oleh Google Gemini!",
      data: aiResponse.text,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
      data: null,
    });
  }
});

// server-nya harus di-serve dulu!
app.listen(
  3000, // port yang akan diakses
  () => {
    console.log("I LOVE YOU 3000");
  },
);
