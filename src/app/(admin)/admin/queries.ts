import { wait } from "@/lib/utils";

export async function getCurrentUser() {
  // TODO: Replace with better-auth session check
  // const session = await auth();
  // if (!session) return null;

  await wait();

  // Mock user data for now
  return {
    id: 1,
    fullName: "Admin User",
    age: 25,
    email: "admin@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getAdminPosts() {
  await wait();

  return [
    {
      id: 1,
      title: "Sample Post",
      shortDescription: "This is a sample post for the admin panel",
      content: "Full content of the sample post...",
      categoryId: 1,
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function getAdminCategories() {
  await wait();

  return [
    {
      id: 1,
      name: "Technology",
      postCount: 5,
    },
    {
      id: 2,
      name: "Design",
      postCount: 3,
    },
  ];
}

export async function getAdminUsers() {
  await wait();

  return [
    {
      id: 1,
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      fullName: "Regular User",
      email: "user@example.com",
      role: "user",
      createdAt: new Date().toISOString(),
    },
  ];
}
