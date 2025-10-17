// import dependencies
//
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

// kita import dan langsung panggil function-nya
import 'dotenv/config';

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

const ai = new GoogleGenAI({ }); // instantiation menjadi object instance (OOP -- Object-Oriented Programming)

// inisialisasi middleware
// contoh: app.use(namaMiddleware());
app.use(cors()); // inisialisasi CORS (Cross-Origin Resource Sharing) sebagai middleware
app.use(express.json());

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
app.post('/generate-text', async (req, res) => {
  // terima jeroannya, lalu cek di sini
  const { prompt } = req.body; // object destructuring

  // debugging
  console.log({ prompt });

  // guard clause (kasarnya, satpam)
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Prompt harus berupa string!',
      data: null
    });
    return;
  }

  // jeroannya
  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt }
      ],
      // ini untuk config AI-nya lebih jauh lagi
      config: {
        systemInstruction: 'Harus dibalas dalam bahasa Jepang atau Sunda secara acak.'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil dijawab sama Gemini nih!',
      data: aiResponse.text
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Gagal gan, server-nya kayaknya lagi bermasalah!',
      data: null
    });
  }
});

// server-nya harus di-serve dulu!
app.listen(
  3000, // port yang akan diakses
  () => {
    console.log('I LOVE YOU 3000');
  }
);
