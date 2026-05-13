import { useCallback, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroScreen from "./components/IntroScreen";
import Layout from "./components/Layout";
import HomePageTest from "./pages/HomePageTest";
import CloudPage from "./pages/CloudPage";
import DesktopPage from "./pages/DesktopPage";
import ReviewsPage from "./pages/ReviewsPage";
import ExplorePage from "./pages/ExplorePage";

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  return (
    <BrowserRouter>
      <IntroScreen onComplete={handleIntroComplete} />
      <div className={introComplete ? "app-shell app-shell--ready" : "app-shell"}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePageTest />} />
            <Route path="/cloud" element={<CloudPage />} />
            <Route path="/desktop" element={<DesktopPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/explore" element={<ExplorePage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
