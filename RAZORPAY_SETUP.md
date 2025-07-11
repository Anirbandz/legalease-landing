# Razorpay Integration Setup

## Environment Variables

Add these to your `.env.local` file:

```bash
# Razorpay Configuration
# Get these from your Razorpay Dashboard: https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=rzp_live_6RJrMUxHaHjUYt
RAZORPAY_KEY_SECRET=Vw9tIWCwaAYlEJKFjVuT0ogt

# For production, use your live keys:
# RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
# RAZORPAY_KEY_SECRET=your_live_key_secret_here
```

## Database Setup

Run the updated SQL schema in your Supabase dashboard:

```sql
-- The updated supabase-setup.sql file includes payment tables
-- Run this in your Supabase SQL editor
```

## Pricing

The integration uses your original pricing:
- **Monthly Pro Plan**: ₹99
- **Yearly Pro Plan**: ₹999

## Features

✅ Complete Razorpay payment flow  
✅ Payment verification and signature validation  
✅ Subscription activation after successful payment  
✅ Database storage for orders and payments  
✅ User subscription management  
✅ Loading states and error handling  
✅ Toast notifications for user feedback  

## API Routes

- `POST /api/payment/create` - Creates Razorpay order
- `POST /api/payment/verify` - Verifies payment and activates subscription

## Testing

1. Use Razorpay test mode for development
2. Test cards: https://razorpay.com/docs/payments/payments/test-mode/
3. Test UPI: success@razorpay

## Production Deployment

1. Switch to live Razorpay keys
2. Update webhook URLs in Razorpay dashboard
3. Test with real payment methods 