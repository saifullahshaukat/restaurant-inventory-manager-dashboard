import config from '@/config';
import { useState, useEffect } from 'react';
import { CreditCard, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentMethod {
  id: number;
  stripe_payment_method_id: string;
  type: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}

interface SavedPaymentMethodsProps {
  refreshTrigger?: number;
}

export const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
  refreshTrigger,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${config.apiUrl}/api/payment-methods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setMethods(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [refreshTrigger]);

  const handleSetDefault = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/payment-methods/${id}/set-default`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Default payment method updated');
        fetchPaymentMethods();
      } else {
        throw new Error(data.error || 'Failed to set default');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update default payment method');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/payment-methods/${deleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment method removed');
        setDeleteId(null);
        fetchPaymentMethods();
      } else {
        throw new Error(data.error || 'Failed to delete payment method');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove payment method');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="h-8 w-8" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No payment methods</h3>
        <p className="text-muted-foreground">
          Add a payment method to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={method.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getCardIcon(method.card_brand)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {method.card_brand} •••• {method.card_last4}
                      </span>
                      {method.is_default && (
                        <Badge variant="secondary" className="bg-gold text-white">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.card_exp_month}/{method.card_exp_year}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(method.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedPaymentMethods;
