import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import ArticleSection from "./components/ArticleSection";
import PostDetails from "./components/PostDetails";
import Login from "./components/Login";
import Register from "./components/Register";
import UserProfile from "./components/UserProfile";
import AdminPanel from "./components/AdminPanel";
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <Toaster position="top-right" richColors />
        <Analytics />
      </div>
    </Router>
  );
}

export default App;


