import { DB, db } from "@/db";
import { postTag } from "@/db/schema";

import { faker } from "@faker-js/faker";
import { PostTagSchema } from "../schema/postTag";

const mock = async () => {
  const [postsData, tagsData] = await Promise.all([
    db.query.post.findMany(),
    db.query.tag.findMany(),
  ]);

  const randomPosts = faker.helpers.arrayElements(postsData);

  const data: PostTagSchema[] = randomPosts.flatMap((post) => {
    const randomTags = faker.helpers.arrayElements(tagsData);
    return randomTags.map((tag) => ({ postId: post.id, tagId: tag.id }));
  });

  return data;
};

export async function seed(db: DB) {
  const insertData = await mock();
  await db.insert(postTag).values(insertData);
}
