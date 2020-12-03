import './App.css';
import {useState} from 'react'; 
import {loadStripe} from '@stripe/stripe-js'; 
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';

// this will look only like a checkout page using Elements

const CARD_ELEMENT_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#c4f0ff',
      color: '#fff',
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {color: '#fce883'},
      '::placeholder': {color: '#87bbfd'},
    },
    invalid: {
      iconColor: '#ffc7ee',
      color: '#ffc7ee',
    },
  },
};

const CardField = ({onChange}) => (
  <fieldset className="FormGroup">
    <div className="FormRow">
      <CardElement options={CARD_ELEMENT_OPTIONS} onChange={onChange} />
    </div>
  </fieldset>
);

// this is the CheckoutForm component 
const CheckoutForm = () => {
  const [error, setError] = useState(null); 
  const stripe = useStripe();
  const elements = useElements();

  // handle real-time validation errors from card Element. 
  const handleChange = (event) => {
    if (event.error) {
      setError(event.error.message); 
    } else {
      setError(null);
    }
  }

  // handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card);
    if (result.error) {
      // inform user
      setError(result.error.message);
    } else {
      setError(null);
      // send token to server
      stripeTokenHandler(result.token);
    }
  };

  // the iframe is missing here somewhere 

  
  return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label for="card-element">
            Credit or debit card
          </label>
          <CardElement 
            id='card-element'
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleChange}
          />
          <div className='card-errors' role='alert'>{error}</div>
        </div>
        <button type='submit'> Submit Payment </button>
      </form>
  ); 
};

// now this setups up stripe JS 
const stripePromise = loadStripe('pk_test_ttmjufMXd3LISDdpzg2v8fvH00RN5YyBcB');

function App() {
  return (
      <div className='StripeElement' class='App-header'>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements> 
      </div>
  );
}

// FORGOT TO POST THE ID TO THE BACKEND! 
async function stripeTokenHandler(token) {
  const response = await fetch('/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({token: token.id})
  });
  return response.json();

}

export default App;
