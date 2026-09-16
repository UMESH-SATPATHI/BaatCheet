import Router from "./Router";
import PWAInstallProvider from "./lib/PWAInstallContext";
import PWAInstallModal from "./components/PWAInstallModal";

export default function App() {
  return (
    <PWAInstallProvider>
      <Router />
      <PWAInstallModal />
    </PWAInstallProvider>
  );
}