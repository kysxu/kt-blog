import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import ArticleSection from "./components/ArticleSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <div className="flex-grow">
        <HeroSection />
        <ArticleSection />
      </div>
      <Footer />
    </div>
  );
}

export default App;

