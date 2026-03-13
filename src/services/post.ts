import { prisma } from "../lib/prisma.js";

export type PostPropsType = {
  title: string;
  content: string;
  body: string;
  image: string | null;
  authorId: number;
  categoryName: string;
  typeName: string;
  tags: string[];
};

export const createOnePost = async (postData: PostPropsType) => {
  const data: any = {
    title: postData.title,
    content: postData.content,
    body: postData.body,
    image: postData.image,
    user: {
      connect: {
        id: postData.authorId,
      },
    },
    category: {
      connectOrCreate: {
        where: {
          name: postData.categoryName,
        },
        create: {
          name: postData.categoryName,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: {
          name: postData.typeName,
        },
        create: {
          name: postData.typeName,
        },
      },
    },
    tags: {
      connectOrCreate: postData.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      })),
    },
  };
  return prisma.post.create({ data });
};
export const getPost = async (id: number) => {
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });
  return post;
};
