# Cloudflare Worker Payment Integration

This project implements a payment integration using Cloudflare Workers and Stripe Checkout.

## Prerequisites

- Node.js and npm installed
- Cloudflare account
- Stripe account

## Setup

1. Clone this repository:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Cloudflare Worker:
   ```
   npx create-cloudflare@latest pay --existing-script pay
   ```

4. Configure your environment variables:
   Create a `.dev.vars` file in the root directory and add your Stripe API key:
   ```
   STRIPE_API_KEY=your_stripe_api_key_here
   ```

5. Set up GitHub Actions:
   - Create a `.github/workflows/push.yml` file in your repository.
   - Add the following content to the file:
     ```yaml
     name: Deploy Worker
     on:
       push:
         branches:
           - main
     jobs:
       deploy:
         runs-on: ubuntu-latest
         timeout-minutes: 60
         needs: test
         steps:
           - uses: actions/checkout@v4
           - name: Build & Deploy Worker
             uses: cloudflare/wrangler-action@v3
             with:
               apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
               accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
     ```
   - In your GitHub repository settings, add the following secrets:
     - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

   Note: Make sure to set up the `test` job referenced in the `needs` field before the `deploy` job.
