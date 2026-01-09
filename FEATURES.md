# Shift - Feature Overview

## 🎯 Core Marketplace Features

### Listings
- **Create Listings**: Full-featured form with title, description (Markdown), price, category, location, and up to 5 images
- **Browse Listings**: Search, filter by category/location/price, view by category
- **Featured Listings**: Homepage showcases latest active listings with images
- **Listing Details**: Full view with image carousel, seller info, reviews, and safety indicators

### Categories
- Electronics 💻
- Clothing & Fashion 👔
- Services 🔧
- Vehicles 🚗
- Home & Garden 🏡
- Sports & Leisure ⚽
- Books & Media 📚
- Toys & Games 🎮
- Collectibles 🎨
- Other 📦

### Search & Discovery
- **Keyword Search**: Search across titles, descriptions, and summaries
- **Category Filter**: Browse specific categories
- **Location Filter**: Find items near you (UK postcodes/cities)
- **Price Range Filter**: Min/max price filtering
- **Status Filter**: Active, sold, or reserved items

## 🔐 Trust & Safety

### Seller Reputation System
- **Star Ratings**: 1-5 star reviews from buyers
- **Written Reviews**: Detailed feedback visible on seller profiles
- **Verified Seller Badge**: Awarded to sellers with:
  - 10+ completed transactions
  - 4.5+ average rating
- **Review History**: Public view of recent seller reviews

### Escrow Protection
- **Secure Payment Hold**: Funds held until delivery confirmed
- **Two-Party Confirmation**: Both buyer and seller must confirm
- **14-Day Auto-Release**: Automatic release if buyer doesn't respond
- **Platform Fee**: 2% on successful transactions only
- **No Chargebacks**: Final settlement protects sellers

### Safety Features
- **Encrypted Messaging**: Private DMs between buyers and sellers (NIP-04)
- **Payment Protection**: Lightning escrow prevents fraud
- **Trust Indicators**: Visual badges and messaging throughout
- **Safety Tips**: Comprehensive guide on safe trading practices
- **Report Listing**: Ability to flag suspicious content

## 💰 Payment System

### Dual Currency Display
- **Primary**: GBP (Pounds Sterling) - familiar for UK users
- **Secondary**: Bitcoin satoshis - calculated equivalent shown below GBP
- **Live Conversion**: Approximate conversion based on current BTC/GBP rate

### Lightning Network Integration
- **Instant Payments**: Near-instant transaction finalization
- **Low Fees**: Minimal network fees compared to traditional payments
- **Privacy**: No bank details or personal financial information required
- **Escrow Compatible**: Perfect for hold-and-release payment model
- **Global Accessibility**: Anyone with Lightning wallet can participate

## 🎨 Design & UX

### Professional Blue Theme
- **Deep Navy Blue**: Primary color for trust and authority
- **Sky Blue Accents**: Friendly, approachable highlights
- **White/Light Gray Backgrounds**: Clean, professional appearance
- **Trust-Focused**: Color scheme evokes banking/PayPal-like reliability

### User Experience
- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Mobile Responsive**: Fully optimized for phones, tablets, and desktops
- **Fast Loading**: Skeleton loaders and optimized queries
- **Clear CTAs**: Prominent buttons for key actions
- **Visual Hierarchy**: Important information stands out

### Trust Indicators
- **Escrow Badges**: "Your payment is protected" messaging
- **Verified Icons**: Shield checkmark for verified sellers
- **Safety Banners**: Protection information on listing pages
- **Rating Stars**: Visual reputation indicators
- **Transaction Count**: Shows seller experience level

## 📱 Pages & Navigation

### Homepage (`/`)
- Hero section with search bar
- Trust indicators (escrow, verified sellers, secure messaging)
- Category tiles with icons
- Featured listings grid
- How It Works section
- Footer with links

### Search (`/search`)
- Full-page search with filters sidebar (desktop)
- Mobile filters in slide-out sheet
- Results grid with pagination
- Active filter count badge
- Sort and filter options

### Category Pages (`/category/:categoryId`)
- Category-specific listing grid
- Category icon and item count
- Back navigation
- Empty state for new categories

### Listing Detail (`/listing/:listingId`)
- Image carousel with thumbnails
- Price (GBP + sats)
- Seller profile with reputation
- Full description (Markdown rendered)
- Recent reviews
- Contact seller button (for active listings)
- Safety information sidebar
- Edit/mark sold (for own listings)

### Create Listing (`/create-listing`)
- Multi-section form (basic info, images, pricing)
- Image upload with preview
- Markdown description editor
- Category selection
- Location input
- Price with sats conversion preview
- Login required gate

### My Listings (`/my-listings`)
- Tabs for Active/Sold listings
- Grid view of user's listings
- Quick navigation to listing details
- Empty states with CTAs
- Login required gate

### Messages (`/messages`)
- Placeholder for encrypted messaging
- Will integrate with Nostr DMs (NIP-04/NIP-17)
- Login required gate

### How It Works (`/how-it-works`)
- Step-by-step guides for buyers and sellers
- Safety tips and best practices
- Trust feature explanations
- CTAs to get started

## 🛠️ Technical Implementation

### Nostr Protocol
- **NIP-99**: Classified listings (kind 30402)
- **NIP-32**: Seller reviews/reputation (kind 1985)
- **NIP-04**: Encrypted messaging (kind 4)
- **NIP-65**: Relay metadata
- Custom tags for UK-specific data

### Data Flow
1. **Publishing**: Listings published as kind 30402 events to Nostr relays
2. **Querying**: Client queries relays with filters (category, author, etc.)
3. **Parsing**: Events parsed into structured ListingData objects
4. **Validation**: Required fields checked, invalid events filtered
5. **Display**: Rendered in React components with caching

### State Management
- **React Query**: Server state management and caching
- **Local Storage**: User preferences and config
- **Nostr Events**: Source of truth for listings and reviews
- **Real-time Updates**: Subscriptions for new listings (future)

### Image Handling
- **Upload**: Blossom servers for file storage
- **NIP-94 Tags**: Image metadata in event tags
- **Lazy Loading**: Images loaded as needed
- **Responsive**: Multiple sizes for different devices

## 🚀 Future Enhancements

### Phase 2 (Next)
- Real-time messaging UI (NIP-04/NIP-17 integration)
- Lightning wallet connect (NWC/WebLN)
- Actual escrow smart contracts
- Edit listing functionality
- Image optimization and CDN

### Phase 3 (Later)
- Dispute resolution workflow
- Shipping integration (tracking)
- Saved searches and wishlist
- Seller analytics dashboard
- Push notifications
- Mobile app (React Native)

### Phase 4 (Advanced)
- Multisig escrow (trustless)
- Reputation NFTs/badges
- Automated moderation
- Multi-currency support
- International expansion

## 📊 Metrics & Success Indicators

### User Metrics
- Active listings count
- Completed transactions
- Average seller rating
- User retention rate
- Time to first listing

### Business Metrics
- Transaction volume (GBP & sats)
- Platform fees collected
- Dispute rate
- Verified seller ratio
- Category popularity

### Technical Metrics
- Page load time
- Listing query performance
- Image upload success rate
- Relay availability
- Error rates

## 🎓 For Developers

### Key Files
- `/src/types/marketplace.ts` - Core types and utilities
- `/src/hooks/useListings.ts` - Listing queries
- `/src/hooks/useSellerReputation.ts` - Reputation queries
- `/NIP.md` - Custom Nostr protocol documentation

### Adding Categories
Edit `CATEGORIES` array in `/src/types/marketplace.ts`

### Customizing Theme
Update CSS variables in `/src/index.css` (`:root` and `.dark` sections)

### Adding New Filters
Extend `ListingsFilters` interface and update `useListings` hook

### Relay Configuration
Default relays in `App.tsx` - users can customize via settings

## 📝 Notes

- **Escrow is Planned**: Current version shows UI/UX; actual Lightning escrow integration coming in Phase 2
- **Messaging is Placeholder**: DM system exists in template but not yet integrated with purchase flow
- **BTC Price**: Currently uses approximate rate; should be fetched from API in production
- **UK Focus**: Designed for UK market but easily adaptable for other regions
- **Nostr-Native**: Fully decentralized, no central database or server required
