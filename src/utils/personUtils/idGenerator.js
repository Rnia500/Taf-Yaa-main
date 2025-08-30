// src/utils/idGenerator.js
let counter = 0;

/**
 * Generate a unique ID with a given prefix.
 * Example: generateId("person") → "person_1"
 */
export function generateId(prefix = "id") {
  counter += 1;
  const id = `${prefix}_${counter}`;
  console.log(`DBG:idGenerator -> generated id "${id}" (prefix="${prefix}")`);
  return id;
}
