// src/services/storageService.js
import { getDB, saveDB } from "./data/localDB.js";
import { generateId } from "../utils/personUtils/idGenerator";

const USE_LOCAL = true;

async function uploadFileLocal(file, type) {
  return new Promise((resolve, reject) => {
    const id = generateId("file");
    const name = `${type}_${id}`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const record = { id, name, type, url: dataUrl };
      const db = getDB();
      db.files = db.files || [];
      db.files.push(record);
      saveDB();
      resolve(record); // { id, name, type, url }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function uploadFileCloud(file, type) {
  console.warn("Cloud upload not implemented, using local.");
  return uploadFileLocal(file, type);
}

export const storageService = {
  uploadFile: USE_LOCAL ? uploadFileLocal : uploadFileCloud,
};
