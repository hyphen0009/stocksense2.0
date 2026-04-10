# **App Name**: KiranaLink

## Core Features:

- Secure Authentication: Shopkeepers can register and log in using email and password, with registration including essential shop details like shop name. This facilitates secure and personalized access.
- Product & Inventory Management: Add, edit, and delete products by name, category, price, and quantity. Supports barcode scanning for quick product entry. Stores all product data in Firestore.
- Effortless Sales System: Record sales by scanning product barcodes. This automatically reduces inventory quantity and logs the sales history with a timestamp in Firestore.
- Intuitive Inventory Dashboard: A dashboard displaying current stock levels and prominently highlighting products running low.
- Smart Stock Prediction Tool: Analyzes past sales data to predict which products will run out and approximately in how many days, using simple time-series or average sales logic. This tool generates actionable alerts.
- Proactive Alerts & Notifications: Displays critical low stock and predictive run-out alerts directly within the application's UI to help shopkeepers manage stock efficiently.
- Offline Data Sync: Enables basic offline usage, allowing users to continue managing inventory, with automatic data synchronization to Firebase when an internet connection is restored.

## Style Guidelines:

- A calm, earthy, and inviting color palette suitable for local businesses. Primary color (darker green for readability on light backgrounds): '#4D7A2E'. Background color (heavily desaturated and light for clarity): '#F3F6EF'. Accent color (vibrant yellow for important actions and highlights): '#EBEB5A'.
- A single font, 'Inter' (sans-serif), for both headlines and body text to ensure maximum readability and a clean, modern aesthetic for non-technical users.
- Utilize simple, clear, and universally recognizable icons to guide users through inventory and sales processes, especially crucial for a multi-lingual user base.
- Mobile-first and highly responsive design with generous padding and large, easily tappable buttons, optimized for non-technical users and quick interactions.
- Subtle and functional animations to provide visual feedback for user actions like scanning, adding items, or saving data, enhancing the overall user experience without being distracting.