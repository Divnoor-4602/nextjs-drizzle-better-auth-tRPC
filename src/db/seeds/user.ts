import { DB } from "..";
import { user } from "../schema/user";
import { faker } from "@faker-js/faker";

const mock = () => {
  const data: Array<{
    id: string;
    name: string;
    email: string;
    age: number;
  }> = [];

  Array.from({ length: 20 }, () => {
    data.push({
      id: faker.string.uuid(), // Generate a unique ID for each user
      name: faker.person.fullName(), // Use 'name' to match schema
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 99 }),
      // emailVerified, createdAt, updatedAt have defaults in the schema
      // image is optional so we can omit it
    });
  });

  return data;
};

export async function seed(db: DB) {
  await db.insert(user).values(mock());
}
