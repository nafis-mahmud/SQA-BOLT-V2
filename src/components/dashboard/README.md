# Supply Chain Hub Project

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps to Run Locally

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

3. **Start the development server**
   ```bash
   npm run dev
   # or if you use yarn
   yarn dev
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The project dashboard should be visible with all the project cards
   - You can click on any project card to view its details

### Project Structure
- `/src/components/dashboard` - Contains all dashboard-related components
- `/src/components/ui` - Contains reusable UI components (ShadCN)

### Features
- View all projects in grid or list view
- Filter projects by category
- Search projects by title or description
- View detailed project information
- Tabs for dashboards, charts, and actions
