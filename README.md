# Cloud-Native E-Library - Frontend Web App

### Student Information
* **Name:** Mahesha Dinushan Heenatigala
* **Student Number:** 2301692062
* **Slack Handle:** Mahesha Dinushan
* **GCP Project ID:** project-c341f623-6f55-4fea-bae

---

## Project Description
The Frontend Web Application serves as the primary user interface for the Cloud-Native E-Library platform. It allows users to browse a catalog of books, manage book entries (Create, Read, Update, Delete), upload media (covers and documents), and view PDF documents securely directly in the browser. It is built with a focus on responsive design and seamless integration with the backend microservices through the Spring Cloud API Gateway.

**Public URL:** [136.110.3.118]

## Technology Stack
* **Framework:** Next.js / React
* **Styling:** Tailwind CSS, Shadcn/UI
* **State Management & Data Fetching:** SWR, React Hooks
* **Icons:** Lucide React
* **Deployment:** Google Cloud Platform (GCP)

## Prerequisites
* Node.js (v18 or higher)
* npm or yarn package manager
* Backend API Gateway must be running for data fetching

## Setup & Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MaheshaDinu/cloud-native-e-library-frontend.git
   cd frontend-web-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a [.env.local] file in the root directory and configure the Gateway URL:
   Code snippet
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
Run the development server:

Bash
npm run dev
Access the application: Open http://localhost:3000 in your web browser.
   
