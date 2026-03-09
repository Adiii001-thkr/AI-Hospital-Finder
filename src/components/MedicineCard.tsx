import { Pill, Building2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MedicineCardProps {
  name: string;
  description: string | null;
  manufacturer: string | null;
  price: number | null;
  category: string | null;
  stockQuantity: number | null;
}

export function MedicineCard({ name, description, manufacturer, price, category, stockQuantity }: MedicineCardProps) {
  const inStock = (stockQuantity ?? 0) > 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Pill className="w-6 h-6 text-primary" />
          </div>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
        
        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          {manufacturer && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{manufacturer}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className={inStock ? 'text-success' : 'text-destructive'}>
              {inStock ? `${stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="font-display font-bold text-xl text-primary">
            ₹{price?.toFixed(2) ?? '0.00'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
