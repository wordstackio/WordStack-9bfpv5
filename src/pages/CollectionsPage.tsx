import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUser } from "@/lib/auth";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addPoemToCollection,
  removePoemFromCollection,
  reorderCollections,
  getPublishedPoems
} from "@/lib/storage";
import { mockPoems } from "@/lib/mockData";
import { Collection } from "@/types";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Search,
  Save,
  X
} from "lucide-react";

export default function CollectionsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [managingPoems, setManagingPoems] = useState<Collection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!user.isPoet) {
      navigate("/feed");
      return;
    }

    loadCollections();
  }, [user, navigate]);

  const loadCollections = () => {
    if (user) {
      const userCollections = getCollections(user.id);
      setCollections(userCollections);
    }
  };

  if (!user) return null;

  const allPoems = [...mockPoems, ...getPublishedPoems()].filter(p => p.poetId === user.id);
  
  const filteredPoems = searchTerm
    ? allPoems.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allPoems;

  const handleCreateCollection = () => {
    if (!formName.trim()) {
      alert("Please enter a collection name");
      return;
    }

    createCollection(user.id, formName, formDescription, formCoverImage);
    
    // Reset form
    setFormName("");
    setFormDescription("");
    setFormCoverImage("");
    setShowCreateForm(false);
    loadCollections();
  };

  const handleUpdateCollection = () => {
    if (!editingCollection || !formName.trim()) return;

    updateCollection(editingCollection.id, {
      name: formName,
      description: formDescription,
      coverImage: formCoverImage
    });

    setFormName("");
    setFormDescription("");
    setFormCoverImage("");
    setEditingCollection(null);
    loadCollections();
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (confirm("Are you sure you want to delete this collection? Poems won't be deleted.")) {
      deleteCollection(collectionId);
      loadCollections();
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...collections];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderCollections(user.id, newOrder.map(c => c.id));
    setCollections(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === collections.length - 1) return;
    const newOrder = [...collections];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderCollections(user.id, newOrder.map(c => c.id));
    setCollections(newOrder);
  };

  const startEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormName(collection.name);
    setFormDescription(collection.description || "");
    setFormCoverImage(collection.coverImage || "");
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingCollection(null);
    setFormName("");
    setFormDescription("");
    setFormCoverImage("");
  };

  const togglePoemInCollection = (collectionId: string, poemId: string, isInCollection: boolean) => {
    if (isInCollection) {
      removePoemFromCollection(collectionId, poemId);
    } else {
      addPoemToCollection(collectionId, poemId);
    }
    loadCollections();
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/poet/${user.id}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Page
            </Button>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              Manage Collections
            </h1>
            <p className="text-muted-foreground">
              Organize your poems into themed collections
            </p>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => {
              setShowCreateForm(true);
              setEditingCollection(null);
              setFormName("");
              setFormDescription("");
              setFormCoverImage("");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Collections List */}
          <div className="lg:col-span-2 space-y-6">
            {collections.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-2">No Collections Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first collection to organize your poems by theme, mood, or series.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Collection
                </Button>
              </Card>
            ) : (
              collections.map((collection, index) => (
                <Card key={collection.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {collection.coverImage && (
                      <img 
                        src={collection.coverImage} 
                        alt={collection.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link to={`/collection/${collection.id}`}>
                            <h3 className="font-serif text-2xl font-bold hover:text-primary transition-colors">
                              {collection.name}
                            </h3>
                          </Link>
                          {collection.description && (
                            <p className="text-muted-foreground mt-1 leading-relaxed">
                              {collection.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === collections.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {collection.poemIds.length} {collection.poemIds.length === 1 ? 'poem' : 'poems'}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setManagingPoems(collection)}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Manage Poems
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(collection)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <Link to={`/collection/${collection.id}`}>
                          <Button variant="ghost" size="sm">
                            View Page
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar - Create/Edit Form */}
          <div className="space-y-6">
            {(showCreateForm || editingCollection) && (
              <Card className="p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl font-bold">
                    {editingCollection ? "Edit Collection" : "Create Collection"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      cancelEdit();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Collection Name *
                    </label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Love & Loss"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief description of this collection..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <ImageIcon className="w-4 h-4" />
                      Cover Image URL
                    </label>
                    <Input
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                    {formCoverImage && (
                      <img 
                        src={formCoverImage} 
                        alt="Preview"
                        className="w-full h-32 object-cover rounded mt-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                        }}
                      />
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={editingCollection ? handleUpdateCollection : handleCreateCollection}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCollection ? "Save Changes" : "Create Collection"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collections:</span>
                  <span className="font-medium">{collections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Poems:</span>
                  <span className="font-medium">{allPoems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organized:</span>
                  <span className="font-medium">
                    {allPoems.filter(p => p.collectionIds && p.collectionIds.length > 0).length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Manage Poems Modal/Panel */}
        {managingPoems && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[80vh] overflow-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Manage Poems</h2>
                  <p className="text-muted-foreground">{managingPoems.name}</p>
                </div>
                <Button variant="ghost" onClick={() => setManagingPoems(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search poems..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredPoems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "No poems found" : "No poems yet. Write your first poem!"}
                  </p>
                ) : (
                  filteredPoems.map(poem => {
                    const isInCollection = managingPoems.poemIds.includes(poem.id);
                    return (
                      <div
                        key={poem.id}
                        className="flex items-center justify-between p-4 border border-border rounded hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{poem.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {poem.content.substring(0, 100)}...
                          </p>
                        </div>
                        <Checkbox
                          checked={isInCollection}
                          onCheckedChange={() => 
                            togglePoemInCollection(managingPoems.id, poem.id, isInCollection)
                          }
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  {managingPoems.poemIds.length} {managingPoems.poemIds.length === 1 ? 'poem' : 'poems'} in this collection
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
