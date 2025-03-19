# Running the Supply Chain Hub Project Locally

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if you use yarn
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   For demo purposes, you can run without these variables as the app has a mock authentication system.

4. **Start the development server**
   ```bash
   npm run dev
   # or if you use yarn
   yarn dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Demo Login Credentials
- Email: demo@example.com
- Password: password123

## Project Structure
- `/src/components/dashboard` - Dashboard components
- `/src/components/auth` - Authentication components
- `/src/components/ui` - UI components (ShadCN)

## Building for Production
```bash
npm run build
# or if you use yarn
yarn build
```

## Preview Production Build
```bash
npm run preview
# or if you use yarn
yarn preview
```
