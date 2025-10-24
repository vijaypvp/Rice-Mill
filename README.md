# Rice Mill Shop - Billing System

A simple, runnable billing system and marketing website for a rice shop.

- Backend: Node.js + Express
- Frontend: Vue 3 (CDN) + CSS
- Features: 15 rice variants, cart, checkout, invoice, basic marketing sections

## Run locally

1. Install backend deps

```bash
# from the project root
npm --prefix server install
```

2. Start the server

```bash
npm --prefix server start
```

3. Open the site

- Visit: http://localhost:3000

## API

- `GET /api/products` – list products
- `GET /api/marketing` – marketing content
- `POST /api/orders` – create order

Order body example:

```json
{
  "customer": { "name": "Akash", "phone": "9876543210" },
  "items": [ { "productId": 1, "qtyKg": 5 } ]
}
```

Response contains an `id`, `lines`, `subtotal`, `tax`, `total`.

Notes:
- Stock updates are stored back into `server/data/products.json` for demo purposes.
- For production, replace with a proper database and authentication.

## Deploy to Render

### Before deploying
- Ensure all product images are in `web/images/` (currently using JPEG format)
- The project is ready to deploy with all 15 rice variant images included

### One-click deploy

1. **Push to GitHub**
   - Create a new GitHub repository
   - Push this project to the repo:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
     git push -u origin main
     ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New** ? **Blueprint**
   - Connect your GitHub repository
   - Render will detect `render.yaml` and configure automatically
   - Click **Apply** to deploy
   - Wait 2-3 minutes for build to complete

3. **Access your app**
   - Click the service URL (e.g., `https://rice-shop.onrender.com`)
   - Your site and API are live!

### Persistence
- The `render.yaml` includes a **1GB persistent disk** mounted at `/server/data`
- Stock updates to `products.json` will persist across deploys and restarts
- Free tier disk is retained for 90 days after last deploy

### Custom Domain
- In Render Dashboard ? Your Service ? Settings ? Custom Domain
- Add your domain (e.g., `shop.yourdomain.com`)
- Update DNS with the CNAME record provided by Render
- HTTPS certificate is auto-provisioned

### Environment Variables
If you need to add configuration:
- Render Dashboard ? Your Service ? Environment
- Add variables like `PORT`, `NODE_ENV`, etc.
