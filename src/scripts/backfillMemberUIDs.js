import { db } from "../config/firebase";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";

export async function backfillMemberUIDs() {
  const treesSnap = await getDocs(collection(db, "trees"));
  let count = 0;

  for (const t of treesSnap.docs) {
    const data = t.data();
    const members = data.members || [];
    const memberUIDs = members.map(m => m.userId);

    if (memberUIDs.length > 0) {
      await updateDoc(doc(db, "trees", t.id), { memberUIDs });
      count++;
    }
  }

  console.log(`✅ Migration complete. Updated ${count} trees.`);
}
