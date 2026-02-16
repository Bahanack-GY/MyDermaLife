# Products Integration - Complete Implementation

## Overview

Full implementation of products API integration with pagination, filtering, and specialized endpoints for featured products, new arrivals, and best sellers.

**Base URL**: `https://api.myderma.evols.online/api/v1`

---

## API Endpoints

### Public Endpoints (No Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | List products with filters & pagination |
| `/products/featured` | GET | Get featured products |
| `/products/new-arrivals` | GET | Get new arrivals |
| `/products/best-sellers` | GET | Get best sellers |
| `/products/:idOrSlug` | GET | Get single product by ID or slug |
| `/products/:id/routine` | GET | Get product routine/complements |

---

## Query Parameters

### GET `/products` - Available Filters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 12 | Items per page (max: 100) |
| `sortBy` | string | createdAt | name, price, createdAt, rating, totalSales |
| `sortOrder` | string | DESC | ASC or DESC |
| `search` | string | — | Search in name, description, SKU |
| `categoryId` | UUID | — | Filter by category ID |
| `minPrice` | number | — | Minimum price filter |
| `maxPrice` | number | — | Maximum price filter |
| `skinType` | string | — | oily, dry, normal, combination |
| `isFeatured` | boolean | — | Filter featured products |
| `isBestSeller` | boolean | — | Filter best sellers |
| `requiresPrescription` | boolean | — | Filter by prescription requirement |

### Example Requests

```typescript
// Get all products (paginated)
GET /api/v1/products?page=1&limit=12

// Search for creams
GET /api/v1/products?search=cream&page=1&limit=12

// Filter by category and price range
GET /api/v1/products?categoryId=uuid&minPrice=5000&maxPrice=30000

// Get oily skin products, sorted by price
GET /api/v1/products?skinType=oily&sortBy=price&sortOrder=ASC

// Get featured products with pagination
GET /api/v1/products?isFeatured=true&page=1&limit=8
```

---

## TypeScript Types

### Product Interface

```typescript
interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brandName: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentCategory?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  price: number;
  compareAtPrice?: number;
  requiresPrescription: boolean;
  ingredients: string[] | null;
  usageInstructions: string | null;
  warnings: string | null;
  benefits: string[] | null;
  skinTypes: string[] | null;
  conditionsTreated: string[] | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  images: ProductImage[];
  routine: RoutineItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface RoutineItem {
  stepOrder: number;
  stepLabel: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    primaryImage: string | null;
  } | null;
}

interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## React Query Hooks

### Basic Product Hooks

```typescript
import {
  useProducts,
  useFeaturedProducts,
  useNewArrivals,
  useBestSellers,
  useProduct,
  useProductRoutine,
  useProductsByCategory,
  useSearchProducts,
} from '../hooks/queries/useProducts';
```

### 1. Get All Products (Paginated)

```tsx
function ProductsPage() {
  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 12,
    sortBy: 'price',
    sortOrder: 'ASC'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <h1>Products ({data.total})</h1>
      <div className="grid">
        {data.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
      />
    </div>
  );
}
```

### 2. Get Featured Products

```tsx
function FeaturedSection() {
  const { data: products } = useFeaturedProducts();

  return (
    <section>
      <h2>Featured Products</h2>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
```

### 3. Get New Arrivals

```tsx
function NewArrivalsSection() {
  const { data: products } = useNewArrivals();

  return (
    <section>
      <h2>New Arrivals</h2>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
```

### 4. Get Best Sellers

```tsx
function BestSellersSection() {
  const { data: products } = useBestSellers();

  return (
    <section>
      <h2>Best Sellers</h2>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
```

### 5. Get Single Product

```tsx
import { useParams } from 'react-router-dom';

function ProductDetailPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug!);

  if (isLoading) return <div>Loading product...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.shortDescription}</p>
      <p>Price: {product.price} FCFA</p>
      {product.compareAtPrice && (
        <p className="line-through">{product.compareAtPrice} FCFA</p>
      )}

      {/* Images */}
      <div className="images">
        {product.images.map(img => (
          <img
            key={img.id}
            src={getImageUrl(img.imageUrl)}
            alt={img.altText || product.name}
          />
        ))}
      </div>

      {/* Benefits */}
      {product.benefits && (
        <ul>
          {product.benefits.map((benefit, i) => (
            <li key={i}>{benefit}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 6. Get Product Routine

```tsx
function ProductRoutine({ productId }: { productId: string }) {
  const { data: routine } = useProductRoutine(productId);

  if (!routine || routine.length === 0) return null;

  return (
    <section>
      <h3>Complete Your Routine</h3>
      {routine.map((item) => (
        <div key={item.stepOrder}>
          <span>Step {item.stepOrder}: {item.stepLabel}</span>
          {item.product && (
            <Link to={`/products/${item.product.slug}`}>
              <img src={getImageUrl(item.product.primaryImage)} alt={item.product.name} />
              <p>{item.product.name}</p>
              <p>{item.product.price} FCFA</p>
            </Link>
          )}
        </div>
      ))}
    </section>
  );
}
```

### 7. Filter Products by Category

```tsx
function CategoryPage() {
  const { categoryId } = useParams();
  const { data, isLoading } = useProductsByCategory(categoryId!, {
    page: 1,
    limit: 12
  });

  return (
    <div>
      <h1>Category Products</h1>
      {data?.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 8. Search Products

```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useSearchProducts(query, {
    page: 1,
    limit: 20
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />

      {isLoading && <div>Searching...</div>}

      {data && (
        <div>
          <p>Found {data.total} products</p>
          {data.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Image Handling

All product images use relative paths from the API. Use the `getImageUrl` utility:

```typescript
import { getImageUrl } from '../api/config';

// Product primary image
const primaryImage = product.images.find(img => img.isPrimary);
<img src={getImageUrl(primaryImage?.imageUrl)} alt={product.name} />

// All images
{product.images
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map(img => (
    <img key={img.id} src={getImageUrl(img.imageUrl)} alt={img.altText} />
  ))
}
```

---

## Pagination Component Example

```tsx
function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? 'active' : ''}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
```

---

## Advanced Filtering Example

```tsx
function ProductsWithFilters() {
  const [filters, setFilters] = useState<ProductQueryParams>({
    page: 1,
    limit: 12,
    sortBy: 'price',
    sortOrder: 'ASC',
  });

  const { data, isLoading } = useProducts(filters);

  const handleFilterChange = (key: keyof ProductQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.skinType || ''}
          onChange={(e) => handleFilterChange('skinType', e.target.value || undefined)}
        >
          <option value="">All Skin Types</option>
          <option value="oily">Oily</option>
          <option value="dry">Dry</option>
          <option value="normal">Normal</option>
          <option value="combination">Combination</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ''}
          onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ''}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
        />

        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="totalSales">Popularity</option>
        </select>

        <button onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}>
          {filters.sortOrder === 'ASC' ? '↑' : '↓'}
        </button>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {data?.data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={data?.page || 1}
            totalPages={data?.totalPages || 1}
            onPageChange={(page) => handleFilterChange('page', page)}
          />
        </>
      )}
    </div>
  );
}
```

---

## Product Card Component Example

```tsx
import { getImageUrl } from '../api/config';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="image">
        <img
          src={getImageUrl(primaryImage?.imageUrl)}
          alt={product.name}
        />
        {product.isNew && <span className="badge">New</span>}
        {product.isBestSeller && <span className="badge">Best Seller</span>}
      </div>

      <div className="details">
        <h3>{product.name}</h3>
        <p className="description">{product.shortDescription}</p>

        <div className="price">
          <span className="current">{product.price.toLocaleString()} FCFA</span>
          {product.compareAtPrice && (
            <span className="compare">{product.compareAtPrice.toLocaleString()} FCFA</span>
          )}
        </div>

        <div className="rating">
          <Star className="fill-amber-400" />
          <span>{product.rating}</span>
          <span>({product.totalReviews} reviews)</span>
        </div>

        {product.stockQuantity === 0 && (
          <span className="out-of-stock">Out of Stock</span>
        )}
      </div>
    </Link>
  );
}
```

---

## Summary

✅ **Complete product types** matching API response
✅ **Pagination support** for product lists
✅ **Specialized endpoints** (featured, new, best sellers)
✅ **Advanced filtering** (price, skin type, category, etc.)
✅ **Product search** functionality
✅ **Product routines** for complement products
✅ **Image handling** with utility functions
✅ **Category integration** already done
✅ **React Query** for caching and state management
✅ **Type-safe** with full TypeScript support

Everything is configured and ready to use! 🎉
