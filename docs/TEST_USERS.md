# Test User Credentials

The following test users have been created in the database for testing the authentication system:

## Admin User
- **Email:** admin@restaurant.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Full access to all features

## Manager User
- **Email:** manager@restaurant.com
- **Password:** manager123
- **Role:** User
- **Access:** Standard user access

## Regular Users

### User 1
- **Email:** user@restaurant.com
- **Password:** user123
- **Role:** User
- **Access:** Standard user access

### User 2 (Staff)
- **Email:** staff@restaurant.com
- **Password:** staff123
- **Role:** User
- **Access:** Standard user access

---

## Notes
- All users are associated with the business "Mommy's Kitchen"
- Admin user has role='admin' for future admin-only features
- All authenticated users can access all dashboard pages including Settings
- Users can update their email, phone number, and profile settings
- These credentials are already seeded in the database via `schema.sql`
- Use these credentials at http://localhost:8080/login

## Security Reminder
**IMPORTANT:** These are test credentials for development only. Never use these passwords in production!
