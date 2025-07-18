import express from 'express';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import axios from 'axios';
import { createRequire } from 'module';
import cors from 'cors';
import Upload_router from './UploadRoute.js';


const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(fileUpload());
app.use(cors());

app.use(express.json());

app.use('/api/upload', Upload_router);


app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});
