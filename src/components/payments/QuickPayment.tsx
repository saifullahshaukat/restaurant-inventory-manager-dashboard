import config from '@/config';
import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, CreditCard } from 'lucide-react';

interface PaymentMethod {
  id: number;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  stripe_payment_method_id: string;
}

interface PaymentResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  success: boolean;
  message: string;
  amount?: string;
}

const PaymentResultDialog: React.FC<PaymentResultDialogProps> = ({
  open,
  onOpenChange,
  success,
  message,
  amount,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            {success ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
                <DialogDescription className="text-base">
                  {amount && <p className="text-xl font-semibold text-green-600 mb-2">${amount}</p>}
                  <p>{message}</p>
                </DialogDescription>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <DialogTitle className="text-2xl">Payment Failed</DialogTitle>
                <DialogDescription className="text-base">
                  <p className="text-red-600 font-medium mb-2">Transaction Declined</p>
                  <p className="text-sm">{message}</p>
                </DialogDescription>
              </>
            )}
          </div>
        </DialogHeader>
        <Button
          onClick={() => onOpenChange(false)}
          className={success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
        >
          {success ? 'Done' : 'Try Again'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const QuickPaymentForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('new');
  const [showResult, setShowResult] = useState(false);
  const [paymentResult, setPaymentResult] = useState({ success: false, message: '' });

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${config.apiUrl}/api/payment-methods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setSavedCards(data.data);
        const defaultCard = data.data.find((card: PaymentMethod) => card.is_default);
        if (defaultCard) {
          setSelectedCard(defaultCard.id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved cards:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !amount) {
      return;
    }

    if (selectedCard === 'new' && !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create payment intent
      const response = await fetch('${config.apiUrl}/api/payments/create-intent', {
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
        throw new Error(data.error || 'Failed to create payment');
      }

      let confirmResult;

      if (selectedCard === 'new') {
        // Use new card
        const cardElement = elements?.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not found');

        confirmResult = await stripe.confirmCardPayment(data.data.clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });
      } else {
        // Use saved card
        const card = savedCards.find(c => c.id.toString() === selectedCard);
        if (!card) throw new Error('Selected card not found');

        confirmResult = await stripe.confirmCardPayment(data.data.clientSecret, {
          payment_method: card.stripe_payment_method_id,
        });
      }

      if (confirmResult.error) {
        setPaymentResult({
          success: false,
          message: confirmResult.error.message || 'Payment was declined by your bank. Please try another card.',
        });
        setShowResult(true);
        toast.error(confirmResult.error.message);
      } else {
        setPaymentResult({
          success: true,
          message: 'Your payment has been processed successfully!',
        });
        setShowResult(true);
        toast.success('Payment completed successfully!');
        setAmount('');
        setDescription('');
        onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      setPaymentResult({
        success: false,
        message: errorMessage,
      });
      setShowResult(true);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
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

        {savedCards.length > 0 && (
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={selectedCard} onValueChange={setSelectedCard}>
              {savedCards.map((card) => (
                <div key={card.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value={card.id.toString()} id={`card-${card.id}`} />
                  <Label htmlFor={`card-${card.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">
                        {card.card_brand} •••• {card.card_last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {card.card_exp_month}/{card.card_exp_year}
                      </p>
                    </div>
                    {card.is_default && (
                      <span className="text-xs bg-gold text-white px-2 py-1 rounded">Default</span>
                    )}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="new" id="card-new" />
                <Label htmlFor="card-new" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Use a new card</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {selectedCard === 'new' && (
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
            <p className="text-xs text-muted-foreground">
              Test card: 4242 4242 4242 4242 (any future date, any CVC)
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || isProcessing || !amount}
          className="w-full bg-gold hover:bg-gold-light"
        >
          {isProcessing ? 'Processing...' : `Pay $${amount || '0.00'}`}
        </Button>
      </form>

      <PaymentResultDialog
        open={showResult}
        onOpenChange={setShowResult}
        success={paymentResult.success}
        message={paymentResult.message}
        amount={amount}
      />
    </>
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
