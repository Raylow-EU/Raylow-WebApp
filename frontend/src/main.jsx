import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import App from "./App.jsx";
import AuthStateListener from "./components/Authentication/AuthStateListener";

// Main app entry point - sets up Redux store and authentication listener
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      {" "}
      {/* Provides Redux store to entire app */}
      <AuthStateListener>
        {" "}
        {/* Listens for auth state changes */}
        <App /> {/* Main app component with routing */}
      </AuthStateListener>
    </Provider>
  </StrictMode>
);
