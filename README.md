# CDI Image Editor

A multi-modal AI image editing suite for Home Renovation visualization, Marketplace product staging, and general creative edits using Gemini 2.5 Flash Image.

**Organization:** Constructive Designs Inc

## Features

- **Renovation Visualizer**: Upload "before" photos and product images to generate renovated scenes.
- **Marketplace Studio**: Create professional product backgrounds while preserving the actual product condition.
- **Creative Edit**: General purpose AI image editing.
- **Project Estimates**: Analyze text-based scopes of work to generate visual results.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

## Deployment

This project is configured for Firebase Hosting.

To deploy the application to the live environment:

```bash
npm run build
firebase deploy
```

### Custom Domain Configuration

To host this app at **images.constructivedesignsinc.org**:

1.  Ensure you have run `firebase login` and have access to the project.
2.  Open the [Firebase Console](https://console.firebase.google.com/).
3.  Navigate to **Hosting** > **Dashboard**.
4.  Click **Add custom domain**.
5.  Enter `images.constructivedesignsinc.org`.
6.  Firebase will provide you with DNS records (TXT and A records).
7.  Log in to your domain registrar (where you manage `constructivedesignsinc.org`) and add these records.
    *   *Note: DNS propagation can take up to 24 hours, but usually happens within minutes.*
8.  Once verified, Firebase will automatically provision an SSL certificate and serve your app at the custom subdomain.
