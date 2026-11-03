import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { PageHeader } from '../components/PageHeader';
import { useFavoris } from '../hooks/useFavoris';
import { usePageMeta } from '../hooks/usePageMeta';

export function Favoris() {
  usePageMeta({ title: 'Mes favoris', path: '/favoris', noIndex: true });
  const { favoris } = useFavoris();

  return (
    <div>
      <PageHeader
        title="Mes favoris"
        description={
          favoris.length > 0
            ? `${favoris.length} article${favoris.length > 1 ? 's' : ''} mis de côté`
            : 'Gardez sous la main les articles que vous commandez souvent.'
        }
      />

      {favoris.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            icon={Heart}
            title="Aucun favori pour le moment"
            description="Touchez le cœur d’un article pour le retrouver ici."
            action={
              <Link to="/catalogue">
                <Button>Découvrir le catalogue</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {favoris.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      )}
    </div>
  );
}
