import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx"
import Chat from "./Chat.jsx"
import Vote from "./Vote.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/chat",
    element: <Chat />
  },
  {
    path: "/vote",
    element: <Vote />
  },
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
