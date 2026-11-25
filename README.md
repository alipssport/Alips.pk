# Alips.pk
A developing Webpage


## Visual store admin

A private-use product dashboard is available at `/admin/`.

### Using it
1. Publish/deploy the latest `main` branch to the existing website host.
2. Open `https://alips.pk/admin/` (or your deployed site's `/admin/` path).
3. Create a GitHub fine-grained personal access token restricted to this repository with **Contents: Read and write** permission.
4. Enter the token in the admin page and connect.
5. Add/edit products, upload images, and save. The dashboard commits changes to `products.js`; product photos are stored under `assets/products/`.

The token is entered at runtime, held only in the current browser tab's JavaScript memory, and is not saved to local storage or included in site files. Use a dedicated, repository-scoped token and revoke it in GitHub when no longer needed. The admin page is marked no-index; this is not a replacement for GitHub authentication, so access to the admin UI should be treated as a sensitive management page.

### Code editing
Edit `index.html`, `styles.css`, `app.js`, `config.js`, and `products.js` directly in GitHub or your code editor. Product changes made in the visual admin update the same `products.js` catalogue used by the storefront.
