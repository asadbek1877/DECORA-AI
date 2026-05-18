import { useCallback, useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroScreen from "./components/IntroScreen";
import Layout from "./components/Layout";

// Lazy-load all page components (code splitting per route)
const HomePageTest = lazy(() => import("./pages/HomePageTest"));
const CloudPage = lazy(() => import("./pages/CloudPage"));
const DesktopPage = lazy(() => import("./pages/DesktopPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));

// Loading fallback component (lightweight)
function PageLoader() {
  return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  return (
    <BrowserRouter>
      <IntroScreen onComplete={handleIntroComplete} />
      <div className={introComplete ? "app-shell app-shell--ready" : "app-shell"}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePageTest />} />
              <Route path="/cloud" element={<CloudPage />} />
              <Route path="/desktop" element={<DesktopPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/explore" element={<ExplorePage />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
