// src/services/dataService.js
import { personServiceLocal } from './data/personServiceLocal.js';
import { personServiceFirebase } from './data/personServiceFirebase.js';
import { marriageServiceLocal } from './data/marriageServiceLocal.js';
import { marriageServiceFirebase } from './data/marriageServiceFirebase.js';
import { eventServiceLocal } from './data/eventServiceLocal.js';
import { eventServiceFirebase } from './data/eventServiceFirebase.js';
import { storyServiceLocal } from './data/storyServiceLocal.js';
import { storyServiceFirebase } from './data/storyServiceFirebase.js';
import { clearDB as clearLocalDB } from './data/localDB.js';

import * as storageService from './storageService.js';

const BACKEND = "local"; // or "firebase"

const services = {
  local: {
    ...personServiceLocal,
    ...marriageServiceLocal,
    ...eventServiceLocal,
    ...storyServiceLocal,
  },
  firebase: {
    ...personServiceFirebase,
    ...marriageServiceFirebase,
    ...eventServiceFirebase,
    ...storyServiceFirebase,
  },
};

const dataService = {
  ...services[BACKEND],
  ...storageService,
  clearLocalDB : clearLocalDB,
  // ...(fileService),  // if you split upload/download logic
};

export default dataService;
