import { DB } from "..";
import { category, CategorySchema } from "../schema/category";

const mock: CategorySchema[] = [
  { name: "Node.js" },
  { name: "React.js" },
  { name: "Next.js" },
  { name: "Python" },
  { name: "Javascript" },
  { name: "Algorithms" },
  { name: "APIs" },
];

export async function seed(db: DB) {
  await db.insert(category).values(mock);
}
