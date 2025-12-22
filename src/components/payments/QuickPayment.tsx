import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const QuickPaymentForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !amount) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || 'Quick payment',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error('Failed to create payment');
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error: confirmError } = await stripe.confirmCardPayment(
        data.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        toast.error(confirmError.message);
      } else {
        toast.success('Payment successful!');
        setAmount('');
        setDescription('');
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="Payment for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !amount}
        className="w-full bg-gold hover:bg-gold-light"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount || '0.00'}`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Test card: 4242 4242 4242 4242 (any future date, any CVC)
      </p>
    </form>
  );
};

export const QuickPayment = ({ onSuccess }: { onSuccess?: () => void }) => {
  const stripePromise = getStripe();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>Quick one-time payment</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <QuickPaymentForm onSuccess={onSuccess} />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default QuickPayment;
