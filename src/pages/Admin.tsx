import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Pill, Building, Plus, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';

const medicineSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  description: z.string().trim().max(1000).optional(),
  manufacturer: z.string().trim().max(200).optional(),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().trim().max(100).optional(),
  stock_quantity: z.number().int().min(0, 'Stock must be positive'),
});

const hospitalSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  city: z.string().trim().min(2, 'City is required').max(100),
  address: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  specialties: z.string().optional(),
  type: z.enum(['hospital', 'lab']),
  rating: z.number().min(0).max(5).optional(),
});

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Medicine form state
  const [medName, setMedName] = useState('');
  const [medDescription, setMedDescription] = useState('');
  const [medManufacturer, setMedManufacturer] = useState('');
  const [medPrice, setMedPrice] = useState('');
  const [medCategory, setMedCategory] = useState('');
  const [medStock, setMedStock] = useState('');
  const [medLoading, setMedLoading] = useState(false);
  const [medErrors, setMedErrors] = useState<Record<string, string>>({});
  
  // Hospital form state
  const [hosName, setHosName] = useState('');
  const [hosCity, setHosCity] = useState('');
  const [hosAddress, setHosAddress] = useState('');
  const [hosPhone, setHosPhone] = useState('');
  const [hosEmail, setHosEmail] = useState('');
  const [hosSpecialties, setHosSpecialties] = useState('');
  const [hosType, setHosType] = useState<'hospital' | 'lab'>('hospital');
  const [hosRating, setHosRating] = useState('');
  const [hosLoading, setHosLoading] = useState(false);
  const [hosErrors, setHosErrors] = useState<Record<string, string>>({});

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-6">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: medName,
      description: medDescription || undefined,
      manufacturer: medManufacturer || undefined,
      price: parseFloat(medPrice) || 0,
      category: medCategory || undefined,
      stock_quantity: parseInt(medStock) || 0,
    };

    try {
      medicineSchema.parse(data);
      setMedErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setMedErrors(newErrors);
        return;
      }
    }

    setMedLoading(true);
    
    const { error } = await supabase.from('medicines').insert({
      name: data.name,
      description: data.description,
      manufacturer: data.manufacturer,
      price: data.price,
      category: data.category,
      stock_quantity: data.stock_quantity,
    });

    if (error) {
      toast.error('Failed to add medicine: ' + error.message);
    } else {
      toast.success('Medicine added successfully!');
      setMedName('');
      setMedDescription('');
      setMedManufacturer('');
      setMedPrice('');
      setMedCategory('');
      setMedStock('');
    }
    
    setMedLoading(false);
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: hosName,
      city: hosCity,
      address: hosAddress || undefined,
      phone: hosPhone || undefined,
      email: hosEmail || undefined,
      specialties: hosSpecialties,
      type: hosType,
      rating: parseFloat(hosRating) || undefined,
    };

    try {
      hospitalSchema.parse(data);
      setHosErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setHosErrors(newErrors);
        return;
      }
    }

    setHosLoading(true);
    
    const specialtiesArray = hosSpecialties
      ? hosSpecialties.split(',').map(s => s.trim()).filter(Boolean)
      : null;

    const { error } = await supabase.from('hospitals').insert({
      name: data.name,
      city: data.city,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
      specialties: specialtiesArray,
      type: data.type,
      rating: data.rating,
    });

    if (error) {
      toast.error('Failed to add hospital: ' + error.message);
    } else {
      toast.success('Hospital added successfully!');
      setHosName('');
      setHosCity('');
      setHosAddress('');
      setHosPhone('');
      setHosEmail('');
      setHosSpecialties('');
      setHosType('hospital');
      setHosRating('');
    }
    
    setHosLoading(false);
  };

  const InputError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage medicines and hospitals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Tabs defaultValue="medicines" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="medicines" className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Add Medicine
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Add Hospital
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="medicines">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    Add New Medicine
                  </CardTitle>
                  <CardDescription>
                    Fill in the details to add a new medicine to the catalog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMedicine} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name *</label>
                        <Input
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          placeholder="Paracetamol 500mg"
                          className={medErrors.name ? 'border-destructive' : ''}
                        />
                        <InputError error={medErrors.name} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Input
                          value={medCategory}
                          onChange={(e) => setMedCategory(e.target.value)}
                          placeholder="Pain Relief"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={medDescription}
                        onChange={(e) => setMedDescription(e.target.value)}
                        placeholder="Brief description of the medicine..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Manufacturer</label>
                        <Input
                          value={medManufacturer}
                          onChange={(e) => setMedManufacturer(e.target.value)}
                          placeholder="Cipla"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Price (₹) *</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={medPrice}
                          onChange={(e) => setMedPrice(e.target.value)}
                          placeholder="25.00"
                          className={medErrors.price ? 'border-destructive' : ''}
                        />
                        <InputError error={medErrors.price} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Stock Quantity</label>
                        <Input
                          type="number"
                          value={medStock}
                          onChange={(e) => setMedStock(e.target.value)}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={medLoading}>
                      {medLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding Medicine...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Medicine
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hospitals">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Add New Hospital/Lab
                  </CardTitle>
                  <CardDescription>
                    Fill in the details to add a new hospital or lab
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddHospital} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name *</label>
                        <Input
                          value={hosName}
                          onChange={(e) => setHosName(e.target.value)}
                          placeholder="Apollo Hospital"
                          className={hosErrors.name ? 'border-destructive' : ''}
                        />
                        <InputError error={hosErrors.name} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">City *</label>
                        <Input
                          value={hosCity}
                          onChange={(e) => setHosCity(e.target.value)}
                          placeholder="Mumbai"
                          className={hosErrors.city ? 'border-destructive' : ''}
                        />
                        <InputError error={hosErrors.city} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <Input
                        value={hosAddress}
                        onChange={(e) => setHosAddress(e.target.value)}
                        placeholder="Full address..."
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={hosPhone}
                          onChange={(e) => setHosPhone(e.target.value)}
                          placeholder="+91-22-12345678"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={hosEmail}
                          onChange={(e) => setHosEmail(e.target.value)}
                          placeholder="contact@hospital.com"
                          className={hosErrors.email ? 'border-destructive' : ''}
                        />
                        <InputError error={hosErrors.email} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Specialties (comma-separated)</label>
                      <Input
                        value={hosSpecialties}
                        onChange={(e) => setHosSpecialties(e.target.value)}
                        placeholder="Cardiology, Oncology, Neurology"
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Type *</label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant={hosType === 'hospital' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHosType('hospital')}
                          >
                            Hospital
                          </Button>
                          <Button
                            type="button"
                            variant={hosType === 'lab' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHosType('lab')}
                          >
                            Lab
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rating (0-5)</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={hosRating}
                          onChange={(e) => setHosRating(e.target.value)}
                          placeholder="4.5"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={hosLoading}>
                      {hosLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding Hospital...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Hospital
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
