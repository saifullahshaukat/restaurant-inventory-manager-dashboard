import config from '@/config';
import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AddCardForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      // Save payment method to backend
      const token = localStorage.getItem('token');
      const response = await fetch('${config.apiUrl}/api/payment-methods/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment method saved successfully!');
        onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to save payment method');
      }
    } catch (error) {
      toast.error('Failed to save payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gold hover:bg-gold-light"
      >
        {isProcessing ? 'Saving...' : 'Save Card'}
      </Button>
    </form>
  );
};

export const AddPaymentMethodDialog = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const stripePromise = getStripe();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payment Method</CardTitle>
        <CardDescription>Save a card for future payments</CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-gold hover:bg-gold-light"
          >
            Add New Card
          </Button>
        ) : (
          <Elements stripe={stripePromise}>
            <AddCardForm
              onSuccess={() => {
                setShowForm(false);
                onSuccess?.();
              }}
            />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
};

export default AddPaymentMethodDialog;
