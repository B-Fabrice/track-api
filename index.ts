import 'dotenv/config';
import { db } from './firebase';
import { collection, doc, addDoc, getDocs, updateDoc } from 'firebase/firestore';

interface Product {
  id: string;
  variants: ShopifyVariant[];
}

interface ShopifyVariant {
  id: string,
  productId: string;
  variantId: string;
  price: string;
  path?: string;
}

var productVariants: ShopifyVariant[] = [];

// function to get firebase update
async function getFirebaseProducts() {
  const productVariantSnapshot = await getDocs(collection(db, 'productVariants'));
  productVariants = productVariantSnapshot.docs.map(doc => {
    const data: ShopifyVariant = doc.data() as ShopifyVariant;
    data.path = doc.id;
    return data;
  });
  console.log('finished to get firebase update');
}

async function getPricing(): Promise<void> {
  try {
    const response: any = await fetch(`${process.env.STORE_URL ?? ""}/products.json`, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.ACCESS_TOKEN ?? "",
      },
    })
      .then((value) => value.json())
      .then((data: any) => {
        return data;
      }).catch((er) => {
        console.error(er);
      });



    let responseProducts = response.products as Product[];
    let shopifyProductVariants: ShopifyVariant[] = [];
    for (const element of responseProducts) {
      const variants = element.variants.map((e): ShopifyVariant => ({
        id: e.id,
        productId: element.id,
        variantId: e.id,
        price: e.price,
      }));
      shopifyProductVariants = [...shopifyProductVariants, ...variants];
    }

    for (const variant of shopifyProductVariants) {
      // check if we have variant in firebase database
      if (productVariants.some(e => e.variantId == variant.variantId)) {
        const currentVariant = productVariants.find(e => e.variantId == variant.variantId);
        // check if current price do not match our history price
        if (currentVariant?.price != variant.price) {
          await addDoc(collection(db, 'priceHistory'), {
            variantId: variant.id,
            productId: variant.productId,
            previousPrice: currentVariant?.price,
            newPrice: variant.price,
            updatedDate: new Date(),
          });
          await updateDoc(doc(db, 'productVariants', currentVariant?.path ?? ''), {
            price: variant.price,
          });
          await getFirebaseProducts();
        }
      } else {
        // add it if it does not exists
        await addDoc(collection(db, 'productVariants'), variant);
        await getFirebaseProducts();
      }
    }
    console.log('finished pricing tracking');
    await getPricing();
  } catch {
    await getPricing()
  }
}

try {
  getFirebaseProducts().then(() => getPricing());
} catch {
  getFirebaseProducts().then(() => getPricing());
}
