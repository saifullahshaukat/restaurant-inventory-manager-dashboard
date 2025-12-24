import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SavedPaymentMethods from '@/components/payments/SavedPaymentMethods';
import { AddPaymentMethodDialog } from '@/components/payments/AddPaymentMethodDialog';
import QuickPayment from '@/components/payments/QuickPayment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Zap } from 'lucide-react';
import { useState } from 'react';

const PaymentsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddCard, setShowAddCard] = useState(false);

  const handlePaymentSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout title="Payments">
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <CreditCard className="w-8 h-8 text-gold" />
          <div>
            <h1 className="text-3xl font-display font-bold">Payments</h1>
            <p className="text-muted-foreground">Make payments and manage your cards</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Payment Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Quick Payment</h2>
            </div>
            <QuickPayment onSuccess={handlePaymentSuccess} />
          </div>

          {/* Payment Methods Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold" />
                <h2 className="text-xl font-semibold">Saved Cards</h2>
              </div>
              <Button
                onClick={() => setShowAddCard(true)}
                className="bg-gold hover:bg-gold-light"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
              <Card>
              <CardContent className="pt-6">
                <SavedPaymentMethods refreshTrigger={refreshKey} />
              </CardContent>
            </Card>
          </div>
        </div>

        <AddPaymentMethodDialog
          open={showAddCard}
          onOpenChange={setShowAddCard}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
