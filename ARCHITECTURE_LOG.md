# Architecture Log

This file is the persistent memory for architectural decisions that should remain visible to future contributors and subagents.

## 2026-04-21 - Order payload now stores a 3D design snapshot

### Status
Accepted and implemented.

### Context
The checkout flow previously stored only a minimal design reference inside each order item, mainly `designUrl` and a flat `position` value. That was not enough to preserve the exact 3D configuration chosen by the customer at purchase time.

For Ramon Store, the selected logo placement is part of the purchased product, not just temporary UI state. We also need a stable server-side payload that can be reused by checkout, order history, fulfillment, admin tooling, and future rendering flows without recalculating placement rules from scratch.

### Decision
Each order item now embeds a full `design` snapshot inside the order document.

Current structure in `src/schema/IOrderSchema.ts`:

```ts
{
  storeId: string,
  userId: string,
  items: [
    {
      id: string,
      size: "XS" | "S" | "M" | "L" | "XL" | "XXL",
      colorName: string,
      colorHex: string,
      quantity: number,
      priceUnit: number,
      design: {
        prompt: string,
        imageUrl: string,
        placement: {
          side: "front" | "back",
          preset: "front_center" | "front_chest" | "back_center",
          anchor: "chest" | "center",
          position: [number, number, number],
          rotation: [number, number, number],
          scale: number
        }
      }
    }
  ],
  shipping: { ... },
  total: number
}
```

### Why this shape exists
- Orders must preserve the exact design choice made at checkout time.
- The 3D placement is product data, not only presentation data.
- Future consumers should be able to render or inspect an order without recomputing placement presets from UI-only state.
- This denormalized snapshot reduces coupling between the cart, checkout API, and future admin/order-history flows.

### Implementation notes
- `src/app/cart/components/CartInteractive.tsx` now builds the order payload with `buildOrderItems(...)`.
- `getPlacementSnapshot(...)` converts the selected cart position into a persisted placement object.
- `src/app/api/checkout/route.ts` now reads `item.design.imageUrl` and `item.design.placement.preset` instead of relying on flat legacy fields.
- `src/schema/IOrderSchema.ts` validates the full snapshot with Zod.

### Placement presets currently persisted
- `front_center`
- `front_chest`
- `back_center`

Each preset is saved with concrete `position`, `rotation`, and `scale` values so downstream consumers do not depend on frontend-only constants.

### Validation constraints
- `priceUnit` must be greater than zero.
- `total` must be greater than zero.
- `placement.scale` must be greater than zero.
- `placement.side` must match the selected preset:
  - `back_center` => `side: "back"`
  - `front_center` and `front_chest` => `side: "front"`

## 2026-04-21 - Dynamic storeId handling in checkout

### Status
Accepted and implemented as an interim multi-tenant step.

### Context
The Firebase architecture rules for this repo require root collections such as `orders` to carry `storeId`. We needed the checkout contract to become tenant-aware before the rest of the multi-store rollout is complete.

### Decision
`CreateOrderSchema` now requires `storeId`, and the cart sends it with every checkout request.

Current client behavior:
- `CartInteractive.tsx` reads `process.env.NEXT_PUBLIC_STORE_ID`.
- If the environment variable is not defined, it falls back to `"ramon-store"`.

### Why this exists
- Orders in a root collection must always be attributable to a store.
- Future Firestore queries and security rules depend on `storeId`.
- This keeps the payload aligned with the repo's multi-tenant direction even before a full store-resolution system is introduced.

### Important caveat
The current fallback is a temporary compatibility measure, not the final tenant resolution strategy.

Future work should replace the fallback with a real source of truth, for example:
- store resolution from domain/subdomain
- store resolution from authenticated claims
- store resolution from server-side route context

### Impact on future agents
- Do not remove `storeId` from `orders`.
- Do not flatten the `design` object back into `designUrl` + `position`.
- Any new order, analytics, admin, or fulfillment flow should treat `items[].design` as the canonical purchased design snapshot.
- Any Firestore query touching tenant-owned root collections must include `storeId`.
