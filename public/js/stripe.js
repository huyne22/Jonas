/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51Ox23gP98B4bg7yFbvDszhwwH6URQKuKf7BCsVMB7bI1IYFd6u7G4ak8ItlQ2sVNhZZr24CFTajCPQFwMd4VAvPK007wEVh6B2');

const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3004/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
export{bookTour}