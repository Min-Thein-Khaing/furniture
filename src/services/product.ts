import { prisma } from "../lib/prisma.js";
export interface ProductPropsType {
  name: string;
  description: string;
  price: number;
  discount: number;
  rating: number;
  inventory: number;
  status: string;
  typeName:string;
  authorId: number;
  categoryName: string;
  tags: string[];
  images: string[];
}
export const getProduct = async (id: number) => {
  return await prisma.product.findUnique({
    where: {
      id,
    },
  });
};

export const createProducts = async (productData: ProductPropsType) => {
  const data: any = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    discount: productData.discount,
    rating: productData.rating,
    inventory: productData.inventory,
    status: productData.status,
    user: {
      connect: {
        id: productData.authorId,
      },
    },
    type: {
      connectOrCreate: {
       where: {
         name: productData.typeName,
       },
       create:{
         name: productData.typeName
       }
      },
    },
    category:{
      connectOrCreate: {
        where: {
          name: productData.categoryName,
        },
        create:{
          name: productData.categoryName
        }
      },
    }
  };
  if (productData.images && productData.images.length > 0) {
    data.images = {
      create: productData.images.map((image) => ({
        path: image,
      })),
    };
  }
  if (productData.tags && productData.tags.length > 0) {
    data.tags = {
      connectOrCreate: productData.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      })),
    };
  }
  return await prisma.product.create({
    data,
    include: {
      images: true,
      tags: true,
      category: true,
      type: true,
    },
  });
};
