import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';
import initStripe from 'stripe';
import { useUser } from '../context/user';

export default function Pricing({ plans }) {
  const { user, login, isLoading } = useUser();

  const showSubscribeButton = !!user && !user.is_subscribed;
  const showCreateAccountButton = !user;
  const showManageSubscriptionBUtton = !!user && user.is_subscribed;

  const processSubscription = (planId) => async () => {
    const { data } = await axios.get(`/api/subscription/${planId}`);
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <div className='w-full max-w-3xl mx-auto py-16 flex justify-around'>
      {plans.map((plan) => (
        <div key={plan.id} className='w-80 h-40 rounded shadow px-6 py-16'>
          <h2 className='text-xl'>{plan.name}</h2>
          <p className='text-gray-500'>
            {plan.price / 100}
            {plan.currency} / {plan.interval}
          </p>
          {!isLoading && (
            <div>
              {showSubscribeButton && (
                <button onClick={processSubscription(plan.id)}>
                  Subscribe
                </button>
              )}
              {showCreateAccountButton && (
                <button onClick={login}>Create account</button>
              )}
              {showManageSubscriptionBUtton && (
                <Link href='/dashboard'>
                  <a>Manage subscription</a>
                </Link>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const getStaticProps = async () => {
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

  const { data: prices } = await stripe.prices.list();

  const plans = await Promise.all(
    prices.map(async (price) => {
      const product = await stripe.products.retrieve(price.product);
      return {
        id: price.id,
        name: product.name,
        price: price.unit_amount,
        interval: price.recurring.interval,
        currency: price.currency,
      };
    })
  );

  const sortedPlans = plans.sort((a, b) => a.price - b.price);

  return {
    props: {
      plans: sortedPlans,
    },
  };
};