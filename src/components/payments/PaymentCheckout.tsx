import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CheckoutFormProps {
  orderId?: string;
  onSuccess?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      toast.success('Payment successful!');
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gold hover:bg-gold-light"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

interface PaymentCheckoutProps {
  amount: number;
  orderId?: string;
  description?: string;
  onSuccess?: () => void;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  amount,
  orderId,
  description,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          orderId,
          description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.data.clientSecret);
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch (error) {
      toast.error('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const stripePromise = getStripe();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Amount to pay: ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!clientSecret ? (
          <Button
            onClick={createPaymentIntent}
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light"
          >
            {loading ? 'Initializing...' : 'Proceed to Payment'}
          </Button>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <CheckoutForm orderId={orderId} onSuccess={onSuccess} />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentCheckout;
