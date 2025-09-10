// src/services/data/personServiceFirebase.js

// 1. Copy all your placeholder Firebase functions for people.
async function addPersonFirebase() {
  throw new Error("Firebase addPerson not implemented yet");
}
async function getPersonFirebase() {
  throw new Error("Firebase getPerson not implemented yet");
}

async function updatePersonFirebase() { throw new Error("Not implemented"); }
async function deletePersonFirebase() { throw new Error("Not implemented"); }
async function getAllPeopleFirebase() { throw new Error("Not implemented"); }
async function findPeopleByNameFirebase() { throw new Error("Not implemented"); }
async function getPeopleByTreeIdFirebase() { throw new Error("Not implemented"); }

// 2. Export them in an object with the SAME keys as the local service.
export const personServiceFirebase = {
  addPerson: addPersonFirebase,
  getPerson: getPersonFirebase,
  updatePerson: updatePersonFirebase,
  deletePerson: deletePersonFirebase,
  getAllPeople: getAllPeopleFirebase,
  findPeopleByName: findPeopleByNameFirebase,
  getPeopleByTreeId: getPeopleByTreeIdFirebase,
};