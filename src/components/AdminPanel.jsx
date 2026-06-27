import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { 
  FileText, FolderKanban, Plus, Search, Edit2, Trash2, 
  ChevronLeft, Save, FileEdit, Eye, AlertTriangle 
} from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("articles"); // articles, categories
  const [viewState, setViewState] = useState("list"); // list, create, edit
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form states
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postStatus, setPostStatus] = useState("published"); // published, draft
  const [editingPostId, setEditingPostId] = useState(null);

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState("");

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, draft
  const [categoryFilter, setCategoryFilter] = useState("all"); // all, Cat, Inspiration, etc.

  // Dialog/Modal states
  const [deleteTargetId, setDeleteTargetId] = useState(null); // post id or category name
  const [deleteTargetType, setDeleteTargetType] = useState(null); // 'post' or 'category'

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await api.getCurrentUser();
        // Assume logged in users have access
        loadData();
      } catch (err) {
        toast.error("You must be logged in to access the admin panel.");
        navigate("/login");
      }
    };
    checkAdmin();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await api.fetchAdminPosts();
      setPosts(fetchedPosts || []);
      
      const fetchedCats = await api.fetchCategories();
      setCategories(fetchedCats || []);
    } catch (err) {
      toast.error("Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create or Update Post
  const handleSavePost = async (e, forceStatus) => {
    e.preventDefault();
    if (!postTitle.trim() || !postCategory || !postContent.trim()) {
      toast.error("Please fill in Title, Category, and Content.");
      return;
    }

    const finalStatus = forceStatus || postStatus;

    const postData = {
      title: postTitle,
      category: postCategory,
      image: postImage || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
      description: postDescription || postContent.substring(0, 150) + "...",
      content: postContent,
      status: finalStatus,
      date: new Date().toISOString()
    };

    try {
      if (viewState === "create") {
        await api.createAdminPost(postData);
        toast.success(`Article successfully ${finalStatus === "draft" ? "saved as draft" : "published"}!`);
      } else {
        await api.updateAdminPost(editingPostId, postData);
        toast.success(`Article successfully updated as ${finalStatus === "draft" ? "draft" : "published"}!`);
      }
      resetPostForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save article.");
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setPostTitle(post.title || "");
    setPostCategory(post.category || "");
    setPostImage(post.image || "");
    setPostDescription(post.description || "");
    setPostContent(post.content || "");
    setPostStatus(post.status || "published");
    setViewState("edit");
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setPostTitle("");
    setPostCategory("");
    setPostImage("");
    setPostDescription("");
    setPostContent("");
    setPostStatus("published");
    setViewState("list");
  };

  // Delete Handlers
  const triggerDelete = (id, type) => {
    setDeleteTargetId(id);
    setDeleteTargetType(type);
  };

  const handleConfirmDelete = async () => {
    const id = deleteTargetId;
    const type = deleteTargetType;
    setDeleteTargetId(null);
    setDeleteTargetType(null);

    try {
      if (type === "post") {
        await api.deleteAdminPost(id);
        toast.success("Article deleted successfully.");
      } else if (type === "category") {
        await api.deleteCategory(id);
        toast.success("Category deleted successfully.");
      }
      loadData();
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await api.createCategory(newCategoryName);
      toast.success(`Category "${newCategoryName}" created!`);
      setNewCategoryName("");
      loadData();
    } catch (err) {
      toast.error("Failed to add category.");
    }
  };

  // Filtering Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40 text-lg font-medium text-muted-foreground animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-6 gap-2">
          <h2 className="text-xl font-bold text-foreground mb-4 px-3 hidden lg:block">Admin Panel</h2>
          <button
            onClick={() => { setActiveSection("articles"); setViewState("list"); setSearchQuery(""); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left cursor-pointer ${
              activeSection === "articles"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" /> Articles
          </button>
          <button
            onClick={() => { setActiveSection("categories"); setViewState("list"); setSearchQuery(""); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left cursor-pointer ${
              activeSection === "categories"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FolderKanban className="w-4 h-4" /> Categories
          </button>
        </aside>

        {/* Workspace */}
        <main className="flex-grow">
          {activeSection === "articles" && (
            <div className="flex flex-col gap-6">
              
              {/* LIST VIEW */}
              {viewState === "list" && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Articles Management</h3>
                      <p className="text-sm text-muted-foreground mt-1">Manage draft and published articles.</p>
                    </div>
                    <button
                      onClick={() => setViewState("create")}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-foreground text-background rounded-md text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer w-fit"
                    >
                      <Plus className="w-4 h-4" /> Create Article
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4 bg-muted p-4 rounded-md">
                    <div className="flex-grow relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white w-full text-sm"
                      />
                    </div>
                    
                    {/* Status filter */}
                    <div className="flex gap-4">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md text-foreground text-sm focus:outline-none bg-white min-w-32"
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>

                      {/* Category filter */}
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md text-foreground text-sm focus:outline-none bg-white min-w-36"
                      >
                        <option value="all">All Categories</option>
                        {categories.filter(c => c !== "Highlight").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Articles List */}
                  <div className="border border-border rounded-md overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-foreground">
                      <thead className="bg-muted text-muted-foreground border-b border-border uppercase font-semibold text-xs">
                        <tr>
                          <th className="px-6 py-4">Title</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredPosts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                              No articles found matching filters.
                            </td>
                          </tr>
                        ) : (
                          filteredPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-muted/50">
                              <td className="px-6 py-4 font-medium max-w-xs truncate">{post.title}</td>
                              <td className="px-6 py-4">
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                  {post.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase ${
                                  post.status === "draft"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {post.status || "published"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {new Date(post.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end gap-3.5">
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => triggerDelete(post.id, "post")}
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* CREATE & EDIT FORM VIEW */}
              {(viewState === "create" || viewState === "edit") && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetPostForm}
                      className="p-2 border border-border rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {viewState === "create" ? "Create New Article" : "Edit Article"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Compose your article using title, links, and markdown content.</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSavePost(e)} className="flex flex-col gap-5">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-foreground">Title</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Mindfulness in Daily Life"
                        className="p-3 border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white w-full text-sm"
                        required
                      />
                    </div>

                    {/* Category & Thumbnail Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground">Category</label>
                        <select
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value)}
                          className="p-3 border border-border rounded-md text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground w-full text-sm"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.filter(c => c !== "Highlight").map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Thumbnail URL */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground">Thumbnail Image URL</label>
                        <input
                          type="url"
                          value={postImage}
                          onChange={(e) => setPostImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="p-3 border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white w-full text-sm"
                        />
                      </div>
                    </div>

                    {/* Description Excerpt */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-foreground">Short Description (Excerpt)</label>
                      <input
                        type="text"
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                        placeholder="Brief summary of the article..."
                        className="p-3 border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white w-full text-sm"
                      />
                    </div>

                    {/* Markdown Body */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-foreground">Content (Markdown format)</label>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="## 1. Introduction&#10;&#10;Write your body text here..."
                        rows={12}
                        className="p-4 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white font-mono text-sm leading-normal w-full"
                        required
                      />
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={(e) => handleSavePost(e, "draft")}
                        className="flex items-center gap-1.5 px-6 py-2.5 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <FileEdit className="w-4 h-4" /> Save as Draft
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSavePost(e, "published")}
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-foreground text-background rounded-md text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Save and Publish
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeSection === "categories" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Categories Management</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage article categories.</p>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="flex gap-3 bg-muted p-4 rounded-md">
                <input
                  type="text"
                  placeholder="New category name (e.g. Travel)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="px-3 py-2.5 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white text-sm flex-grow"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-foreground text-background font-semibold rounded-md text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </form>

              {/* Search Categories */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white w-full text-sm"
                />
              </div>

              {/* Categories list */}
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full border-collapse text-left text-sm text-foreground">
                  <thead className="bg-muted text-muted-foreground border-b border-border uppercase font-semibold text-xs">
                    <tr>
                      <th className="px-6 py-4">Category Name</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-6 text-center text-muted-foreground">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => (
                        <tr key={cat} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                            {cat}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {cat === "Highlight" ? (
                              <span className="text-xs text-muted-foreground italic px-2">Default option</span>
                            ) : (
                              <button
                                onClick={() => triggerDelete(cat, "category")}
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Dialog Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-red-500 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-lg font-bold">Confirm Delete</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this {deleteTargetType}? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteTargetId(null); setDeleteTargetType(null); }}
                className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
