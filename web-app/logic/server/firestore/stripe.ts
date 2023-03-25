import { firebaseApp } from '../firebase'
import { getStripePayments, getProducts, createCheckoutSession, onCurrentUserSubscriptionUpdate } from "@stripe/firestore-stripe-payments";

const payments = getStripePayments(firebaseApp, {
    productsCollection: "products",
    customersCollection: "admin_customers",
});

export const getActivePlans = async () => {
    const products = await getProducts(payments, {
        includePrices: true,
        activeOnly: true,
    });
    for (const product of products) {
        console.log(product.name)
    }
    return products
}

export const startSubscription = async (priceId: string) => {
    /*
        Al posto di "price" ----
                               |
                               V
        line_items: [
            { price: myPriceId1 },
            { price: myPriceId2 },
        ], 
    */
      const session = await createCheckoutSession(payments, {
        price: priceId,
        mode: 'subscription',
        //success_url: "https://example.com/payments/success",
        //cancel_url: "https://example.com/payments/cancel",
      });
      console.log(session)
      window.location.assign(session.url);
}

export const listenForSubscriptionUpdates = () => {
    onCurrentUserSubscriptionUpdate(
        payments,
        (snapshot) => {
          for (const change in snapshot.changes) {
            /*if (change.type === "added") {
              console.log(`New subscription added with ID: ${change.subscription.id}`);
            } */
          }
        }
    );
}