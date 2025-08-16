"use server";

export async function deletePostById(id: string) {
  return {
    success: true,
    message: "Post deleted successfully",
  };
}
