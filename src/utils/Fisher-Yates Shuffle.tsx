export const shuffleArray = <T>(array: T[]): T[] => {
  // မူရင်း Array ကို မထိခိုက်အောင် Copy အရင်ကူးပါတယ် (Immutability)
  const shuffled = [...array];

  // နောက်ဆုံး Index ကနေ ရှေ့ကို တစ်ဆင့်ချင်း လှည့်မယ်
  for (let i = shuffled.length - 1; i > 0; i--) {
    
    // 0 နဲ့ i ကြားထဲက Random Index တစ်ခုကို ယူမယ်
    const j = Math.floor(Math.random() * (i + 1));

    // နေရာချင်း လဲလှယ်မယ် (Array Destructuring Assignment)
    // index i ကကောင်ကို j နေရာပို့၊ j ကကောင်ကို i နေရာပို့တာပါ
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};


import { shuffleArray } from "@/utils/helpers"; // သင်သိမ်းထားတဲ့နေရာကနေ ခေါ်သုံးပါ

const RelatedSection = ({ products, currentProduct }) => {
  
  // ၁။ လက်ရှိပစ္စည်းကို အရင်ဖယ်ထုတ်မယ်
  const otherProducts = products.filter((p) => p.id !== currentProduct.id);

  // ၂။ ကျန်တဲ့ပစ္စည်းတွေကို အစီအစဉ်အမှန်ကန်ဆုံး ရောမွှေမယ်
  const shuffledData = shuffleArray(otherProducts);

  // ၃။ ရှေ့ဆုံးက ၄ ခုကိုပဲ ဖြတ်ယူမယ်
  const relatedProducts = shuffledData.slice(0, 4);

  return (
    <div className="grid grid-cols-4 gap-4">
      {relatedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};