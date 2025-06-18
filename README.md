# Task Manager Frontend

This is a React-based frontend for a Task Management application. It allows users to manage teams, tasks, and collaborators with a modern, responsive interface.

## Features

- **User Authentication:** Login system with JWT token storage.
- **Teams & Collaborators:** Create, update, assign, and manage teams and collaborators.
- **Task Management:** Create, assign, and track tasks with status and deadlines.
- **Role-based Access:** Admin and Manager permissions for advanced actions.
- **Responsive UI:** Built with Tailwind CSS and Framer Motion for smooth animations.
- **Reusable Modal Component:** All forms use a single, accessible modal component.

## Main Components

- **Task_Boards:** Main dashboard for viewing and managing teams, tasks, and collaborators.
- **CreateModal:** Generic, accessible modal for all forms (login, create, assign, etc).
- **Login:** Login page using the modal component.

## Folder Structure

```
src/
  components/
    CreateModal.jsx
  pages/
    Login.jsx
    Task_Boards.jsx
  services/
    api.js
```

## How to Run

1. **Install dependencies:**
   ```
   npm install
   ```
2. **Start the development server:**
   ```
   npm run dev
   ```
3. **Access the app:**  
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

- **API URL:**  
  Update the base URL in `src/services/api.js` to match your backend.

- **Styling:**  
  Tailwind CSS classes are used throughout. You can easily customize colors, spacing, and layout.

## Accessibility

- All forms and modals are accessible with keyboard navigation and screen readers.
- Error messages are announced for assistive technologies.

## 🎨 Backend Repository

- https://github.com/tioneOliveira/taskColaborationProject
- For more information about installing and configuring the environment, access the Read Me

```bash
git clone https://github.com/NicolasDonatoSilveira/taskproj.git
cd taskproj
npm install
npm run dev
```

## Good Practices

- State and side effects are managed with React hooks.
- All API calls are handled with async/await and error handling.
- Code is commented for maintainability and onboarding.

## License

This project is for educational purposes.  
Feel free to adapt and use it for your own needs!
