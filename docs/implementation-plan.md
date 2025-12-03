## Affi Mall Requirement Implementation Plan

This document maps the 15 business requirements to concrete engineering tasks across frontend, backend, and infrastructure. Each task will be developed and delivered sequentially.

### Phase 1 – Catalog Experience (Req 2, 3, 5, 11)
- **Global search service**
  - Backend index on `Product.title`, `Product.brand`, `Product.keywords`.
  - `/api/products/search?q=&limit=` endpoint returning lightweight objects for auto-suggest.
  - Frontend search bar displayed in navbar with debounced queries and accessible results list.
- **Advanced filters & pagination**
  - Extend `/api/products` to accept `priceMin`, `priceMax`, `brand`, `categorySlug`, `sort`, `page`, `limit`.
  - UI components for price slider, brand checklist, sort dropdown, and pagination controls.
  - Persist filter state via query params for sharable catalog URLs.
- **Category scalability**
  - Reusable category page template fed from taxonomy JSON so new categories auto-render without code changes.

### Phase 2 – Product Depth (Req 4, 5)
- **Reviews system**
  - New `Review` model referencing `Product` and `User`, with ratings, comment, and status (pending/published).
  - Backend endpoints for CRUD, admin moderation, and aggregate rating per product.
  - Frontend component for read + write review, with authentication guard.
- **Related / recommended products**
  - Service to surface products from same category + shared tags; fallback to featured items.
  - Display carousel on product detail page.
- **Product specs layout**
  - Structured specs table, variant chips, and stock status badge.

### Phase 3 – Checkout & Payments (Req 6, 7, 12)
- **Order schema enhancements**
  - Support payment types: COD, Bank Transfer, Easypaisa, JazzCash.
  - Fields for payment reference, receipt upload (for transfers), and `paymentStatus`.
  - Order timeline fields (`pending`, `confirmed`, `packed`, `shipped`, `delivered`).
- **Checkout UX**
  - Multi-step form (contact, shipping, payment) with validation and order summary.
  - Confirmation page and printable receipt (existing `OrderPrintTemplate`).
- **Security**
  - Input validation, rate limiting for checkout endpoint, and server-side verification of order totals.

### Phase 4 – Customer Accounts & Tracking (Req 6, 8, 12)
- **Profile dashboard**
  - Sections for personal info, saved addresses, payment preferences.
  - Order history list with status badges, timeline modal, and re-order button.
- **Order tracking**
  - Endpoint returning order events; push updates to user dashboard.
  - Email/optional SMS on each status change.

### Phase 5 – Admin Operations (Req 3, 7, 8, 9, 10, 12, 14)
- **CRUD management**
  - Admin API + UI wiring for categories, products (with variant builder), inventory adjustments, discount codes, banners.
  - Order management views allowing status updates and payment verification.
- **Analytics & reports**
  - Sales summary widgets (daily/weekly/monthly revenue, top categories).
  - Export endpoints (CSV) for orders and customers.
- **Notifications**
  - Nodemailer templates for account creation, new order, order status changes.
  - WhatsApp chat widget on frontend and optional Twilio SMS integration hook.

### Phase 6 – SEO, Performance, Hosting (Req 1, 2, 11, 13)
- **SEO**
  - Per-page meta tags, OpenGraph data, canonical URLs, sitemap generator, robots.txt.
  - Schema.org structured data for products and breadcrumbs.
- **Performance**
  - Image optimization, responsive sources, lazy loading, code splitting audits.
  - HTTP caching headers and CDN-ready asset paths.
- **Hosting & scalability**
  - Deployment scripts (Vercel/Netlify for frontend, Render/Fly/Heroku for backend, MongoDB Atlas).
  - Environment variable templates, SSL configuration guidance, horizontal scaling notes.

### Phase 7 – API Readiness (Req 14)
- **Consistent REST layer**
  - Documented endpoints (Swagger) covering all resources used by the web app.
  - Token-based auth for future mobile clients.
  - Versioning strategy (`/api/v1/...`) and pagination standards.

Each phase concludes with regression testing (frontend and backend), documentation updates, and deployment notes to ensure the store is production-ready.

