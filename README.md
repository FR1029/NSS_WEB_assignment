## Project Structure
- `/frontend`: React application for users to submit preferences.
- `/backend`: Node.js server to handle API requests and run the allocation script.

---

## Configuration 
Update the `DEADLINE` variable in the following two files to a time of your choosing (Format: `YYYY-MM-DDTHH:mm:ss`):
1. **Backend:** `backend/server.js` 
2. **Frontend:** `frontend/src/components/PreferenceForm.tsx`

---

## Database Setup
You must have MySQL running on your machine.
1. Create a new database named `assignment`.
2. Run the following SQL commands to set up the required tables and seed the categories:

CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE preferences (
    
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    preference_rank INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE allocations (
    
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    category_id INT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

## Initialize categories

eg., INSERT INTO categories (name, capacity) VALUES 
('C1', 4), ('C2', 6), ('C3', 4), ('C4', 5);

---

## Backend Setup

1. Open a terminal and navigate to the backend folder:
   \`cd backend\`
2. Install dependencies:
   \`npm install\`
3. Start the server:
   \`node run dev\`

---

## Frontend Setup
1. Open a **new** terminal window and navigate to the frontend folder:
   \`cd frontend\`
2. Install dependencies:
   \`npm install\`
3. Start the React development server:
   \`npm run dev\`
