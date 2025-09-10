// src/services/storageService.js
import { getDB, saveDB } from "./data/localDB.js";
import { generateId } from "../utils/personUtils/idGenerator";

const USE_LOCAL = true;

async function uploadFileLocal(file, type) {
  const id = generateId("file");
  const name = `${type}_${id}`;
  const blob = file instanceof Blob ? file : new Blob([file], { type: "audio/webm" });
  const url = URL.createObjectURL(blob);

  const record = { id, name, type, url };
  const db = getDB();
  db.files = db.files || [];
  db.files.push(record);
  saveDB();

  return record; // { id, name, type, url }
}

async function uploadFileCloud(file, type) {
  console.warn("Cloud upload not implemented, using local.");
  return uploadFileLocal(file, type);
}

export const storageService = {
  uploadFile: USE_LOCAL ? uploadFileLocal : uploadFileCloud,
};
