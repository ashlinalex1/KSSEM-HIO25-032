import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ChatbotInterface from "./pages/ChatbotInterface";
import VisualizationPage from "./pages/VisualizationPage";

function App() {
  return (
    <>
      <div className="min-h-screen text-gray-100" style={{ backgroundColor: '#000a56', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/chat" element={<ChatbotInterface />} />
          </Routes>
      </div>
    </>
  )
}

export default App
