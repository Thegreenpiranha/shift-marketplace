# TrustMarket UK

A peer-to-peer marketplace for buying and selling goods and services in the UK, powered by Bitcoin Lightning Network and built on Nostr protocol.

## Features

### 🛍️ Marketplace Features
- **Product Listings**: Create detailed listings with photos, descriptions, and prices
- **Categories**: Electronics, Clothing, Services, Vehicles, Home & Garden, and more
- **Search & Filter**: Search by keywords, filter by location, category, and price range
- **Location-Based**: UK postcodes and cities for local trading
- **Dual Currency Display**: Prices shown in GBP with Bitcoin sats equivalent

### 🔒 Security & Trust
- **Escrow Protection**: Payments held in escrow until delivery confirmation
- **Seller Reputation**: Star ratings and written reviews from buyers
- **Verified Sellers**: Badge for sellers with 10+ transactions and 4.5+ rating
- **Encrypted Messaging**: Secure DMs between buyers and sellers
- **14-Day Protection**: Auto-release protection window for buyers

### ⚡ Lightning Network Payments
- **Instant Payments**: Lightning Network for fast, low-fee transactions
- **2% Platform Fee**: Only on successful transactions
- **No Chargeback Risk**: Final settlement for sellers
- **Privacy-Focused**: No bank details or personal financial information required

### 🎨 User Experience
- **Professional Design**: Clean, trustworthy blue color scheme
- **Mobile Responsive**: Works seamlessly on all devices
- **Trust Indicators**: Escrow badges, verified seller icons, safety messaging
- **Easy Listing Creation**: Drag-and-drop image upload, markdown support
- **User Dashboard**: Manage active and sold listings

## Technology Stack

- **React 18** with TypeScript
- **Nostr Protocol** (NIP-99 Classified Listings)
- **TailwindCSS** for styling
- **shadcn/ui** components
- **Nostrify** for Nostr integration
- **React Query** for data management
- **Vite** for build tooling

## Nostr Protocol

TrustMarket uses the following Nostr NIPs:

- **NIP-99**: Classified Listings for marketplace items
- **NIP-32**: Labeling for seller reputation/reviews
- **NIP-04**: Encrypted direct messages (purchase coordination)
- **NIP-65**: Relay list metadata
- **NIP-57**: Lightning Zaps (planned)

See [NIP.md](./NIP.md) for custom protocol extensions.

## Project Structure

```
src/
├── components/       # UI components
│   ├── ui/          # shadcn/ui components
│   └── auth/        # Authentication components
├── pages/           # Route pages
│   ├── Home.tsx
│   ├── Search.tsx
│   ├── Category.tsx
│   ├── ListingDetail.tsx
│   ├── CreateListing.tsx
│   ├── MyListings.tsx
│   ├── MessagesPage.tsx
│   └── HowItWorks.tsx
├── hooks/           # Custom React hooks
│   ├── useListings.ts
│   ├── useSellerReputation.ts
│   └── ...
├── types/           # TypeScript types
│   └── marketplace.ts
└── lib/             # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Environment

No environment variables required. The app connects to public Nostr relays by default:
- wss://relay.ditto.pub
- wss://relay.nostr.band
- wss://relay.damus.io

Users can customize relays in the app settings.

## Features Roadmap

### Phase 1 (Current)
- ✅ Basic marketplace functionality
- ✅ Listing creation and browsing
- ✅ Seller reputation system
- ✅ Category filtering
- ✅ Search functionality

### Phase 2 (Planned)
- ⏳ Direct messaging integration (NIP-04/NIP-17)
- ⏳ Lightning payment integration (NIP-57)
- ⏳ Escrow smart contracts
- ⏳ Image carousel in listings
- ⏳ Edit listing functionality

### Phase 3 (Future)
- 🔮 Dispute resolution system
- 🔮 Shipping tracking
- 🔮 Wishlist/saved searches
- 🔮 Advanced analytics for sellers
- 🔮 Mobile app (React Native)

## License

MIT License - Built with [Shakespeare](https://shakespeare.diy)

## Contributing

This project is built on Nostr - a truly open protocol. Feel free to:
- Fork and customize for your region/niche
- Suggest improvements via issues
- Submit pull requests

## Support

For questions or support:
- Check [How It Works](./docs/how-it-works.md) page
- Review the [Nostr NIPs](https://github.com/nostr-protocol/nips)
- Open an issue on GitHub

---

**Vibed with [Shakespeare](https://shakespeare.diy)** - AI-powered website builder
