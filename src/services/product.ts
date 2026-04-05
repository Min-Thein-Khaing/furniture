import { prisma } from "../lib/prisma.js";
import { deletePostImages } from "../utils/filesHelper.js";
import { ResponseError } from "../utils/responseError.js";
export interface ProductPropsType {
  id?:number;
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
  user?:{
    firstName:string;
    lastName:string;
  }
}
export const getProduct = async (id: number) => {
  return await prisma.product.findUnique({
    where: {
      id,
    },
  });
};
export const getProductsList = async(option:any)=>{
  return await prisma.product.findMany(option)
}
export const getCategoryList = async()=>{
  return await prisma.category.findMany()
}
export const getTypeList = async()=>{
  return await prisma.type.findMany()
}

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

export const updateProducts = async (id: number, productData: ProductPropsType) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    throw new ResponseError("Product not found", 404, "product_not_found");
  }

  // အရင်ဆုံး physical images တွေကို ဖျက်တဲ့ logic (မှန်ပါတယ်)
  if (productData.images && productData.images.length > 0) {
    if (product.images && product.images.length > 0) {
      const imageNames = product.images.map((image) => image.path);
      await deletePostImages(imageNames);
    }
  }

  // ✅ 1. Data object ကို dynamic တည်ဆောက်ပါ
  const data: any = {};

  // ပို့လာတဲ့ value ရှိမှသာ update လုပ်ဖို့ ထည့်ပါ (undefined ဖြစ်နေရင် ignore လုပ်ဖို့)
  if (productData.name !== undefined) data.name = productData.name;
  if (productData.description !== undefined) data.description = productData.description;
  
  // Price နဲ့ Inventory ကို Number သေချာပြောင်းပြီး NaN မဖြစ်အောင် စစ်ပါ
  if (productData.price !== undefined) {
    data.price = Number(productData.price) || 0;
  }
  
  if (productData.inventory !== undefined) {
    data.inventory = Number(productData.inventory) || 0; // 👈 NaN ဖြစ်ရင် 0 ပြောင်းပေးလိုက်မယ်
  }

  if (productData.discount !== undefined) data.discount = Number(productData.discount) || 0;
  if (productData.rating !== undefined) data.rating = Number(productData.rating) || 0;
  if (productData.status !== undefined) data.status = productData.status;

  if (productData.categoryName) {
  data.category = {
    connectOrCreate: {
      where: { name: productData.categoryName },
      create: { name: productData.categoryName }
    }
  };
}

  if (productData.typeName) {
  data.type = {
    connectOrCreate: {
      where: { name: productData.typeName },
      create: { name: productData.typeName }
    }
  };
}
  // Author ချိတ်ဆက်မှု
  if (productData.authorId) {
    data.user = {
      connect: { id: Number(productData.authorId) },
    };
  }

  // ✅ 2. Images update logic
  if (productData.images && productData.images.length > 0) {
    data.images = {
      deleteMany: {},
      create: productData.images.map((image) => ({
        path: image,
      })),
    };
  }

  // ✅ 3. Tags update logic
  if (productData.tags && productData.tags.length > 0) {
    data.tags = {
      set: [], // အရင် tag တွေကို အကုန်ဖြုတ်မယ်
      connectOrCreate: productData.tags.map((tag: any) => ({
        where: { name: tag.name || tag }, // tag က object ဖြစ်နေရင် tag.name ကိုယူပါ
        create: { name: tag.name || tag },
      })),
    };
  }

  // Final Update call
  return await prisma.product.update({
    where: { id },
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
      category: {
        select: {
          name: true,
        },
      },
      type: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
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
