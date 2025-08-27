// models/MarriageModel.ts

export type MarriageType = "monogamous" | "polygamous";

// Wife inside a polygamous marriage
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

// Monogamous marriage (two spouses only)
export interface MonogamousMarriage {
  id: string;
  treeId: string;
  marriageType: "monogamous";
  spouses: [string, string];
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

  constructor(marriage: Marriage) {
    this.marriage = marriage;
  }


  
  getNextWifeOrder(): number {
    if (this.marriage.marriageType !== "polygamous") return 1;
    const orders = this.marriage.wives.map(w => w.order ?? 0);
    return orders.length > 0 ? Math.max(...orders) + 1 : 1;
  }


  addWife(wife: PolygamousWife): void {
    if (this.marriage.marriageType === "polygamous") {
      this.marriage.wives.push({
        ...wife,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }


  addChild(childId: string, wifeId?: string): void {
    if (this.marriage.marriageType === "monogamous") {
      this.marriage.childrenIds.push(childId);
    } else if (this.marriage.marriageType === "polygamous" && wifeId) {
      const wife = this.marriage.wives.find(w => w.wifeId === wifeId);
      if (wife) {
        wife.childrenIds = wife.childrenIds || [];
        wife.childrenIds.push(childId);
        wife.updatedAt = new Date().toISOString();
      }
    }
  }
}
