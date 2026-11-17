
import Chatbot from "./components/chatbot";

export default function Home() {
  return (
    <main className="app-background">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <div className="page-container">
        <Chatbot />

        <footer className="site-footer">
          <span>© 2026 Nexa Digital Studio</span>
          <span>Powered by OnboardFlow</span>
          <span>DEMONSTRATION PLATFORM</span>
        </footer>
      </div>
    </main>
  );
}
