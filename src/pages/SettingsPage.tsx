import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Building2, Phone, Mail, MapPin, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
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
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" defaultValue="The Mommy's Kitchen" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" defaultValue="Artisan Catering & Gourmet Home Dining" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="0332-5172782" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="hello@mommyskitchen.pk" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Location</Label>
              <Input id="address" defaultValue="Karachi, Pakistan" className="mt-1.5" />
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
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New Order Notifications</p>
                <p className="text-sm text-muted-foreground">Alert when a new inquiry is received</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Payment Reminders</p>
                <p className="text-sm text-muted-foreground">Remind clients about pending payments</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-gold hover:bg-gold-light text-primary-foreground">Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
