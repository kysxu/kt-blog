import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import ArticleSection from "./components/ArticleSection";
import PostDetails from "./components/PostDetails";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <ArticleSection />
                </>
              }
            />
            <Route path="/post/:postId" element={<PostDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;


