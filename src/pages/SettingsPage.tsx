/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Building2, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useUpdateProfile } from '@/hooks/api';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newOrders: true,
    paymentReminders: false,
  });

  // API hooks
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();

  // Sync form data with profile data when it loads
  // This is a valid React pattern for syncing with async data from React Query

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        name: profile.name || prev.name,
        tagline: profile.tagline || prev.tagline,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
      }));
    }

  }, [profile]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    updateProfile(
      {
        name: formData.name,
        tagline: formData.tagline,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
      },
      {
        onSuccess: () => {
          toast.success('Business settings updated successfully!');
        },
        onError: (error: any) => {
          console.error('Error updating profile:', error);
          toast.error('Failed to update business settings');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" subtitle="Manage your business preferences">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your business preferences">
      <div className="max-w-3xl">
        {/* Business Info */}
        <div className="card-premium p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Business Information</h3>
              <p className="text-sm text-muted-foreground">Update your business details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Enter your business name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="Enter a tagline (e.g., 'Catering & Event Services')"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="03XX-XXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Business address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-premium p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Configure alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when stock falls below minimum</p>
              </div>
              <Switch
                checked={notifications.lowStock}
                onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New Order Notifications</p>
                <p className="text-sm text-muted-foreground">Alert when a new inquiry is received</p>
              </div>
              <Switch
                checked={notifications.newOrders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Payment Reminders</p>
                <p className="text-sm text-muted-foreground">Remind clients about pending payments</p>
              </div>
              <Switch
                checked={notifications.paymentReminders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminders: checked })}
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button
            className="bg-gold hover:bg-gold-light text-primary-foreground"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
