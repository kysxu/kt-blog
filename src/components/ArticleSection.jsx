import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
const authorImage = "https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom date formatter to convert ISO 8601 to "Day Month Year" (e.g. 11 September 2024)
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

function BlogCard({ id, image, category, title, description, author, authorAvatar, date }) {
  const avatarUrl = authorAvatar || authorImage;
  return (
    <div className="flex flex-col gap-4">
      <Link to={`/post/${id}`} className="relative h-[212px] sm:h-[360px]">
        <img
          className="w-full h-full object-cover rounded-md"
          src={image}
          alt={title}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex">
          <span className="bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-600 mb-2">
            {category}
          </span>
        </div>
        <Link to={`/post/${id}`}>
          <h2 className="font-bold text-xl mb-2 line-clamp-2 hover:underline text-foreground">
            {title}
          </h2>
        </Link>
        <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
          {description}
        </p>
        <div className="flex items-center text-sm">
          <img
            className="w-8 h-8 rounded-full mr-2 object-cover"
            src={avatarUrl}
            alt={author}
          />
          <span className="text-foreground">{author}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-muted-foreground">{formatDate(date)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ArticleSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(["Highlight", "Cat", "Inspiration", "General"]);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Highlight");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Autocomplete search states
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCats = await api.fetchCategories();
        // Keep Highlight as the first category option
        const merged = ["Highlight", ...fetchedCats.filter(c => c !== "Highlight")];
        setCategories(merged);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Fetch posts when selectedCategory, page, or searchQuery changes
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await api.fetchPosts({
          category: selectedCategory,
          page: page,
          limit: 6,
          keyword: searchQuery,
        });

        if (page === 1) {
          setPosts(data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        }
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search query to limit requests
    const delayDebounceFn = setTimeout(() => {
      loadPosts();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, page, searchQuery]);

  // Fetch autocomplete suggestions (globally across all categories)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const data = await api.fetchPosts({
          keyword: searchQuery,
          limit: 10,
        });
        setSearchResults(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch autocomplete suggestions:", err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Reset page when category or search query changes
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleViewMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto md:px-6 lg:px-8 mb-40 mt-4">
      <h2 className="text-xl font-bold mb-4 px-4 text-foreground">Latest articles</h2>
      
      {/* Search & Category Filter Section */}
      <div className="bg-[#EFEEEB] px-4 py-4 md:py-3 md:rounded-sm flex flex-col space-y-4 md:gap-16 md:flex-row-reverse md:items-center md:space-y-0 md:justify-between mb-10">
        <div className="w-full md:max-w-sm relative">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="py-3 rounded-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-muted-foreground text-foreground bg-white w-full"
            />
          </div>
          
          {/* Autocomplete Dropdown List */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
              {searchResults.map((post) => (
                <div
                  key={post.id}
                  onMouseDown={() => {
                    navigate(`/post/${post.id}`);
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2.5 hover:bg-muted cursor-pointer text-sm text-foreground truncate border-b border-border last:border-0"
                >
                  {post.title}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Mobile Dropdown Category Filter */}
        <div className="md:hidden w-full">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full py-3 rounded-sm text-muted-foreground bg-white focus:ring-0 focus:ring-offset-0 focus:border-muted-foreground">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Desktop Buttons Category Filter */}
        <div className="hidden md:flex space-x-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                disabled={isActive}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-3 transition-all rounded-sm text-sm font-medium border border-transparent ${
                  isActive
                    ? "bg-[#DAD6D1] text-foreground cursor-not-allowed font-semibold"
                    : "text-muted-foreground hover:bg-white hover:text-foreground cursor-pointer"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state at first page load */}
      {isLoading && page === 1 ? (
        <div className="flex justify-center items-center py-20 text-lg font-medium text-muted-foreground animate-pulse">
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-lg text-muted-foreground">
          No articles found.
        </div>
      ) : (
        <>
          {/* Articles Grid */}
          <article className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
            {posts.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                image={blog.image}
                category={blog.category}
                title={blog.title}
                description={blog.description}
                author={blog.author}
                authorAvatar={blog.authorAvatar}
                date={blog.date}
              />
            ))}
          </article>

          {/* View More & Loading more state */}
          <div className="flex flex-col items-center justify-center mt-12 gap-4">
            {isLoading && page > 1 && (
              <div className="text-sm font-medium text-muted-foreground animate-pulse">
                Loading...
              </div>
            )}
            
            {page < totalPages && !isLoading && (
              <button
                onClick={handleViewMore}
                className="px-6 py-3 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-all font-semibold cursor-pointer"
              >
                View more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}