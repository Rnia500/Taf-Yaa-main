// src/models/marriage.ts

import { generateId } from "../../utils/personUtils/idGenerator";

export type MarriageType = "monogamous" | "polygamous";

export interface PolygamousWife {
  wifeId: string;
  order?: number;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  notes?: string | null;
  childrenIds?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonogamousMarriage {
  id: string;
  treeId: string;
  marriageType: "monogamous";
  spouses: [string, string]; // two Person IDs
  childrenIds: string[];
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolygamousMarriage {
  id: string;
  treeId: string;
  marriageType: "polygamous";
  husbandId: string;
  wives: PolygamousWife[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type Marriage = MonogamousMarriage | PolygamousMarriage;

export class MarriageModel {
  marriage: Marriage;

  constructor(treeId: string, type: MarriageType, createdBy: string) {
    this.marriage =
      type === "monogamous"
        ? {
            id: generateId("marriage"),
            treeId,
            marriageType: "monogamous",
            spouses: ["", ""], // will be filled later
            childrenIds: [],
            createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : {
            id: generateId("marriage"),
            treeId,
            marriageType: "polygamous",
            husbandId: "",
            wives: [],
            createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
  }

  addSpouse(personId: string): void {
    if (this.marriage.marriageType === "monogamous") {
      if (!this.marriage.spouses[0]) this.marriage.spouses[0] = personId;
      else if (!this.marriage.spouses[1]) this.marriage.spouses[1] = personId;
      else throw new Error("Monogamous marriage already has 2 spouses");
    } else {
      throw new Error("Use addWife for polygamous marriage");
    }
    this.marriage.updatedAt = new Date().toISOString();
  }

  addWife(wifeId: string): void {
    if (this.marriage.marriageType === "polygamous") {
      this.marriage.wives.push({
        wifeId,
        order: this.marriage.wives.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.marriage.updatedAt = new Date().toISOString();
    } else {
      throw new Error("Use addSpouse for monogamous marriage");
    }
  }

  addChild(childId: string, wifeId?: string): void {
    if (this.marriage.marriageType === "monogamous") {
      this.marriage.childrenIds.push(childId);
    } else {
      const wife = this.marriage.wives.find((w) => w.wifeId === wifeId);
      if (!wife) throw new Error(`Wife ${wifeId} not found in polygamous marriage`);
      wife.childrenIds = wife.childrenIds || [];
      wife.childrenIds.push(childId);
      wife.updatedAt = new Date().toISOString();
    }
    this.marriage.updatedAt = new Date().toISOString();
  }
}
