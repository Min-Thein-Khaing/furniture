import { prisma } from "../lib/prisma.js";
import { ResponseError } from "../utils/responseError.js";

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
  };
  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      })),
    };
  }
  return prisma.post.create({ data });
};

export const updateOnePost = async(id:number,postData:PostPropsType)=>{
  const data: any = {
    title: postData.title,
    content: postData.content,
    body: postData.body,
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
  };
  if(postData.image){
    data.image = postData.image;
  }

  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      })),
    };
  }

  return prisma.post.update({
    where: {
      id: id,
    },
    data,
    include: {
      tags: true,
      category: true,
      type: true,
    },
  });
}

export const getPost = async (id: number) => {
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
    include: {
      tags: true,
      category: true,
      type: true,
    },
  });
  return post;
};
export const postDelete = async (id: number) => {

  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) {
    throw new ResponseError("Post not found",404,"post_not_found");
  }

  const deletedPost = await prisma.post.delete({
    where: { id }
  });

  return deletedPost;
};