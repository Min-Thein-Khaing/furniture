import { prisma } from "../lib/prisma.js";
import { deletePostImages } from "../utils/filesHelper.js";
import { ResponseError } from "../utils/responseError.js";
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

export const updateProducts = async (id:number,productData: ProductPropsType) => {
  const product= await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
    },
  });
  if (!product) {
    throw new ResponseError("Product not found", 404, "product_not_found");
  }
  // Only delete old physical images if new images are being uploaded
  if (productData.images && productData.images.length > 0) {
    if (product.images && product.images.length > 0) {
      const imageNames = product.images.map((image) => image.path);
      await deletePostImages(imageNames);
    }
  }
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
      deleteMany: {},
      create: productData.images.map((image) => ({
        path: image,
      })),
    };
  }
  if (productData.tags && productData.tags.length > 0) {
    data.tags = {
      set: [],
      connectOrCreate: productData.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      })),
    };
  }
  return await prisma.product.update({
    where: {
      id,
    },
    data,
    include: {
      images: true,
      tags: true,
      category: true,
      type: true,
    },
  });
};

export const deleteProducts = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
    },
  });
  if (!product) {
   
    throw new ResponseError("Product not found", 404, "product_not_found");
  }
  if (product.images && product.images.length > 0) {
    const imageNames = product.images.map((image) => image.path);
    await deletePostImages(imageNames);
  }
  return await prisma.product.delete({
    where: {
      id,
    },
  });
};


export const getProductWithRelation = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      rating: true,
      inventory: true,
      images: {
        select: {
          path: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    images: product.images.map((img) => ({
      path: `http://localhost:${process.env.PORT}/uploads/optimize/${img.path.replace(/\.[^/.]+$/, "")}.webp`,
    })),
    user: product.user
      ? {
          firstName: product.user.firstName,
          lastName: product.user.lastName,
          fullName: `${product.user.firstName} ${product.user.lastName}`,
        }
      : null,
  };
};