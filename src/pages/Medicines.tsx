import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pill, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SearchBar } from '@/components/SearchBar';
import { MedicineCard } from '@/components/MedicineCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Medicine {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  price: number | null;
  category: string | null;
  stock_quantity: number | null;
}

export default function Medicines() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchMedicines();
  }, [searchQuery, selectedCategory]);

  const fetchMedicines = async () => {
    setLoading(true);
    
    let query = supabase
      .from('medicines')
      .select('*')
      .order('name');

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%`);
    }

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching medicines:', error);
    } else {
      setMedicines(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(m => m.category).filter(Boolean) as string[])];
      setCategories(uniqueCategories);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Pill className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Medicines
              </h1>
              <p className="text-muted-foreground">
                Browse and search our medicine catalog
              </p>
            </div>
          </div>
          
          <div className="mt-6 max-w-xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search medicines by name, description, or manufacturer..."
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      {categories.length > 0 && (
        <section className="py-4 bg-card border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
              </div>
              
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <LoadingSpinner text="Loading medicines..." />
          ) : medicines.length === 0 ? (
            <EmptyState 
              type={searchQuery ? 'search' : 'medicines'} 
              message={searchQuery ? `No medicines found for "${searchQuery}"` : undefined}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{medicines.length}</span> medicines
                </p>
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {medicines.map((medicine, index) => (
                  <div key={medicine.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <MedicineCard
                      name={medicine.name}
                      description={medicine.description}
                      manufacturer={medicine.manufacturer}
                      price={medicine.price}
                      category={medicine.category}
                      stockQuantity={medicine.stock_quantity}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
