
# DevNest SMM Platform

*Instagram Social Media Marketing automation platform with intelligent bot account creation*

## Overview

DevNest SMM Platform is a comprehensive Instagram marketing automation system that provides real followers, likes, and engagement through internal bot networks. Unlike traditional SMM providers that rely on external APIs, we create and manage our own Instagram bot accounts to deliver authentic engagement.

## Key Features

### 🤖 Automated Bot Account Creation
- **Automatic Instagram Account Generation**: Creates new Instagram accounts using temporary emails and phone verification
- **Smart Account Management**: Intelligent rotation and health monitoring of bot accounts
- **Scheduled Creation**: Automated daily account creation to maintain a healthy bot pool
- **Multiple Account Sources**: Admin-managed, user-contributed, and auto-generated accounts

### 📈 Instagram Growth Services
- **Real Followers**: Organic follower growth using real Instagram accounts
- **Post Engagement**: Likes and comments from authentic bot accounts
- **Campaign Management**: Create targeted growth campaigns with custom settings
- **Analytics Dashboard**: Track growth metrics and campaign performance

### 🔧 Advanced Management
- **Admin Panel**: Complete control over bot accounts, orders, and system health
- **User Accounts**: Multi-Instagram account support for users
- **Order Processing**: Internal order fulfillment using bot network
- **Real-time Monitoring**: Live tracking of bot performance and system status

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk
- **Automation**: Puppeteer for Instagram bot interactions
- **Payment**: PayPal, M-Pesa integration
- **Deployment**: Replit

## System Architecture

### Bot Account Creation Pipeline
1. **Temporary Services Integration**
   - Email services (TempMail, GuerrillaMail)
   - Phone verification (SMS-Activate, Receive-SMS)
   - CAPTCHA solving (AntiCaptcha, 2captcha)

2. **Account Creation Process**
   - Automated Instagram signup with Puppeteer
   - Phone and email verification handling
   - Profile completion and setup
   - Integration into bot account pool

3. **Account Management**
   - Health monitoring and rotation
   - Daily action limits (500 for dedicated, 100 for user accounts)
   - Automatic detection of banned accounts
   - Performance analytics and optimization

### Service Delivery
- **Internal Processing**: Orders fulfilled using our bot network
- **Smart Targeting**: AI-powered audience targeting
- **Rate Limiting**: Instagram-compliant action limits
- **Quality Assurance**: Real engagement from authentic accounts

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account for authentication
- External service API keys:
  - SMS-Activate or similar phone verification
  - TempMail or email service
  - CAPTCHA solving service (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd devnest-smm-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your API keys and database connection

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start the development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# Bot Account Creation Services
SMS_ACTIVATE_API_KEY="your-sms-activate-key"
TEMPMAIL_API_KEY="your-tempmail-key"
ANTICAPTCHA_API_KEY="your-captcha-solver-key"

# Payment Processing
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-secret"
MPESA_CONSUMER_KEY="your-mpesa-key"
MPESA_CONSUMER_SECRET="your-mpesa-secret"
```

## Usage

### Admin Functions
1. **Bot Account Management**: Monitor and manage automated Instagram accounts
2. **Account Creation**: Set up batch or scheduled account creation
3. **Order Monitoring**: Track service delivery and bot performance
4. **System Analytics**: View platform health and usage statistics

### User Features
1. **Connect Instagram**: Link personal Instagram accounts
2. **Create Campaigns**: Set up targeted growth campaigns
3. **Order Services**: Purchase followers, likes, and comments
4. **Track Progress**: Monitor growth analytics and campaign results

## Bot Account Creation

The platform automatically creates Instagram accounts using:

- **Temporary Email Services**: Disposable emails for account registration
- **Phone Verification**: SMS services for Instagram phone verification
- **Browser Automation**: Puppeteer-based account creation and management
- **Intelligent Scheduling**: Distributed creation to avoid detection

## Security & Compliance

- **Instagram TOS Compliant**: Respects rate limits and usage guidelines
- **Account Safety**: Smart rotation prevents account bans
- **Data Protection**: Secure handling of user credentials
- **Payment Security**: PCI-compliant payment processing

## API Endpoints

### Account Creation
- `POST /api/admin/create-accounts` - Create bot accounts
- `GET /api/admin/create-accounts` - Get creation statistics

### Bot Management
- `GET /api/admin/bot-accounts` - List bot accounts
- `POST /api/admin/bot-accounts` - Add new bot account
- `GET /api/admin/bot-accounts/stats` - Bot performance stats

### Service Processing
- `POST /api/services/purchase` - Purchase Instagram services
- `GET /api/services/orders` - Get order history

## Development

### Project Structure
```
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Core business logic
│   ├── instagram-account-creator.ts  # Bot creation system
│   ├── bot-account-manager.ts       # Account management
│   ├── instagram-bot.ts             # Instagram automation
│   └── internal-order-processor.ts  # Order fulfillment
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

### Key Components
- **InstagramAccountCreator**: Automated account creation
- **BotAccountManager**: Account rotation and health monitoring
- **InstagramBot**: Core automation engine
- **InternalOrderProcessor**: Service delivery system

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact: support@devnest-smm.com
- Documentation: [docs.devnest-smm.com](https://docs.devnest-smm.com)

## Disclaimer

This platform is designed for legitimate Instagram marketing purposes. Users are responsible for complying with Instagram's Terms of Service and applicable laws. Use responsibly and ethically.
