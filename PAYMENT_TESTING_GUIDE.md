# Payment Testing Guide

## Test Card Numbers (Stripe Test Mode)

### Successful Payment
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Declined Cards (for testing error handling)
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Card Declined**: `4000 0000 0000 0002`
- **Expired Card**: `4000 0000 0000 0069`
- **Processing Error**: `4000 0000 0000 0119`

### 3D Secure Authentication
- **Requires Auth**: `4000 0025 0000 3155`
- **Auth Declined**: `4000 0000 0000 9979`

## Testing Steps

### 1. Add a Payment Method
1. Navigate to **Payments** page
2. Click on **Payment Methods** tab
3. Click **Add Card** button
4. Enter test card: `4242 4242 4242 4242`
5. Enter expiry: `12/25`
6. Enter CVC: `123`
7. Click **Save Card**
8. ✅ Card should appear in the saved methods list

### 2. Make a Quick Payment
1. Go to **Quick Pay** tab
2. Enter an amount (e.g., $50.00)
3. Add a description (e.g., "Test payment")
4. Select a saved card or enter new card details
5. Click **Pay Now**
6. ✅ Payment should succeed and appear in Payment History

### 3. View Payment History
1. Go to **Payment History** tab
2. ✅ Should see list of all payments
3. ✅ Should show date, description, amount, and status
4. ✅ Recent payment should appear at the top

### 4. Manage Payment Methods
1. Go to **Payment Methods** tab
2. Add multiple cards using different test numbers
3. Click **Set as Default** on a card
4. ✅ Card should show "Default" badge
5. ✅ Star icon should appear
6. Click trash icon to delete a card
7. ✅ Confirm deletion
8. ✅ Card should be removed from list

### 5. Test Error Handling
1. Try adding card with declined number: `4000 0000 0000 0002`
2. ✅ Should show error toast message
3. Try payment with insufficient funds: `4000 0000 0000 9995`
4. ✅ Should show clear error message

## Expected Results

### Payment History Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": "50.00",
      "currency": "usd",
      "status": "succeeded",
      "description": "Test payment",
      "created_at": "2024-01-15T10:30:00Z",
      "event_type": "Wedding",
      "client_name": "John Doe"
    }
  ]
}
```

### Saved Payment Methods Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "card_brand": "visa",
      "card_last4": "4242",
      "card_exp_month": 12,
      "card_exp_year": 2025,
      "is_default": true
    }
  ]
}
```

## Database Verification

Check payments in database:
```sql
SELECT 
  p.id,
  p.amount,
  p.status,
  p.description,
  p.created_at,
  u.email
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

Check payment methods:
```sql
SELECT 
  pm.id,
  pm.card_brand,
  pm.card_last4,
  pm.is_default,
  u.email
FROM payment_methods pm
JOIN users u ON pm.user_id = u.id
ORDER BY pm.created_at DESC;
```

## Troubleshooting

### Error: "Payment failed"
- Check browser console for detailed error
- Verify Stripe keys are set in `.env`
- Check network tab for API response

### Error: "Column business_id violates not-null constraint"
- ✅ **FIXED** - Column is now nullable

### Error: "Column o.event_name does not exist"
- ✅ **FIXED** - Query now uses `event_type`

### Card not saving
- Check browser console
- Verify token is valid
- Check Stripe dashboard for customer creation

## Features Implemented

✅ Add payment methods (save cards)
✅ Set default payment method
✅ Delete payment methods
✅ Quick payment with saved cards
✅ Payment history with order details
✅ Stripe Elements integration
✅ Error handling and validation
✅ Loading states and animations
✅ Responsive design
✅ Toast notifications

## Next Steps (Optional Enhancements)

- [ ] Invoice generation and PDF download
- [ ] Subscription management UI
- [ ] Refund functionality from UI
- [ ] Payment receipts via email
- [ ] Multiple currency support
- [ ] Payment analytics and charts
