# TrustMarket UK - Custom Nostr Protocol Extensions

This document defines custom Nostr event kinds used by TrustMarket UK for peer-to-peer marketplace functionality.

## Event Kinds

### Kind 30402: Classified Listing (NIP-99)

TrustMarket UK uses NIP-99 Classified Listings for all marketplace items. See [NIP-99](https://github.com/nostr-protocol/nips/blob/master/99.md) for full specification.

**Required Tags:**
- `d` - Unique identifier for the listing
- `title` - Title of the listing
- `price` - Price in format `["price", "<amount>", "<currency>"]`
- `t` - Category tags (electronics, clothing, services, vehicles, home-garden, etc.)
- `location` - UK postcode or city
- `published_at` - Unix timestamp of first publication
- `status` - Either "active", "sold", or "reserved"

**Optional Tags:**
- `summary` - Short description
- `image` - Product images (multiple allowed)
- `g` - Geohash for precise location

### Kind 1985: Seller Reputation Review (NIP-32)

Used for buyer feedback on sellers after a completed transaction. Uses NIP-32 labeling.

**Event Structure:**
```json
{
  "kind": 1985,
  "content": "<review text>",
  "tags": [
    ["L", "uk.trustmarket/reputation"],
    ["l", "rating", "uk.trustmarket/reputation"],
    ["rating", "<1-5>"],
    ["p", "<seller_pubkey>"],
    ["e", "<listing_event_id>"],
    ["a", "30402:<seller_pubkey>:<listing_d_tag>"]
  ]
}
```

**Tags:**
- `L` - Label namespace: "uk.trustmarket/reputation"
- `l` - Label type: "rating"
- `rating` - Star rating from 1-5
- `p` - Seller's pubkey being reviewed
- `e` - Event ID of the listing (if available)
- `a` - Addressable event reference to the listing

### Kind 4: Purchase Request & Escrow Messages (NIP-04)

Direct messages between buyer and seller for purchase coordination and escrow management.

**Message Types (JSON in encrypted content):**

**1. Purchase Request (Buyer → Seller)**
```json
{
  "type": "purchase_request",
  "listing_id": "<listing_event_id>",
  "listing_naddr": "<naddr_of_listing>",
  "message": "<optional buyer message>",
  "delivery_address": "<encrypted delivery address>",
  "timestamp": <unix_timestamp>
}
```

**2. Escrow Hold Notification (Buyer → Seller)**
```json
{
  "type": "escrow_hold",
  "listing_id": "<listing_event_id>",
  "amount_sats": <amount_in_satoshis>,
  "platform_fee_sats": <2%_fee_in_sats>,
  "invoice": "<lightning_invoice>",
  "preimage_hash": "<payment_preimage_hash>",
  "timestamp": <unix_timestamp>
}
```

**3. Shipping Confirmation (Seller → Buyer)**
```json
{
  "type": "shipping_confirmed",
  "listing_id": "<listing_event_id>",
  "tracking_number": "<optional_tracking>",
  "message": "<optional message>",
  "timestamp": <unix_timestamp>
}
```

**4. Receipt Confirmation (Buyer → Seller)**
```json
{
  "type": "receipt_confirmed",
  "listing_id": "<listing_event_id>",
  "satisfied": true,
  "message": "<optional message>",
  "timestamp": <unix_timestamp>
}
```

**5. Escrow Release Request**
```json
{
  "type": "escrow_release",
  "listing_id": "<listing_event_id>",
  "release_to": "seller",
  "timestamp": <unix_timestamp>
}
```

**6. Dispute Notification**
```json
{
  "type": "dispute",
  "listing_id": "<listing_event_id>",
  "reason": "<dispute reason>",
  "timestamp": <unix_timestamp>
}
```

## Workflow

1. **Listing Creation**: Seller publishes kind 30402 event with product details
2. **Browse & Search**: Buyers query kind 30402 events with category (`#t`) and location filters
3. **Purchase Intent**: Buyer sends purchase request via encrypted DM (kind 4)
4. **Payment Escrow**: Buyer pays Lightning invoice to platform escrow wallet
5. **Shipping**: Seller ships item and confirms via encrypted DM
6. **Receipt**: Buyer confirms receipt via encrypted DM
7. **Release**: Both parties agree to release escrow to seller (or platform releases after timeout)
8. **Review**: Buyer publishes kind 1985 reputation event
9. **Status Update**: Seller updates listing status to "sold" by republishing kind 30402

## Trust & Safety Features

- **Seller Reputation**: Query kind 1985 events tagged with seller's pubkey to calculate average rating
- **Escrow Protection**: 2-of-2 confirmation (buyer receipt + seller ship) before release
- **Verified Badge**: Sellers with 10+ transactions and 4.5+ average rating
- **Time-based Auto-release**: Escrow auto-releases to seller after 14 days if buyer doesn't respond
- **Dispute Resolution**: Platform moderators can intervene in disputes (future feature)

## Categories

Standard category tags (`t` tag values):
- `electronics`
- `clothing`
- `services`
- `vehicles`
- `home-garden`
- `sports`
- `books`
- `toys`
- `collectibles`
- `other`

## UK-Specific Tags

- `location` - Use UK postcodes (e.g., "SW1A 1AA") or cities (e.g., "London", "Manchester")
- `g` - Geohash for location (optional but recommended for local searches)
- `price` - Always use GBP as primary currency: `["price", "250", "GBP"]`
- `price_sats` - Equivalent in satoshis (calculated at posting): `["price_sats", "312500"]` (optional)

## Example Listing

```json
{
  "kind": 30402,
  "created_at": 1704902400,
  "content": "# Canon EOS R6 Camera\n\nBarely used, excellent condition. Includes original box, charger, and strap.\n\n## Specifications\n- 20.1MP Full-Frame Sensor\n- 4K Video Recording\n- In-Body Image Stabilization\n\nCollection preferred, can post for additional £10.",
  "tags": [
    ["d", "canon-eos-r6-12345"],
    ["title", "Canon EOS R6 Camera - Excellent Condition"],
    ["summary", "20.1MP full-frame camera with 4K video, barely used"],
    ["published_at", "1704902400"],
    ["price", "1200", "GBP"],
    ["price_sats", "1500000"],
    ["t", "electronics"],
    ["t", "photography"],
    ["location", "Manchester"],
    ["g", "gcw2j"],
    ["image", "https://image.url/camera1.jpg", "800x600"],
    ["image", "https://image.url/camera2.jpg", "800x600"],
    ["status", "active"]
  ],
  "pubkey": "<seller_pubkey>",
  "id": "<event_id>",
  "sig": "<signature>"
}
```
