
## Route Resolvers

A **Resolver** is a special Angular service that retrieves data **before a route is activated**. Its purpose is to ensure that all required data is available before the component is created.

Without a resolver, a component is instantiated first and then typically makes an HTTP request during `ngOnInit()`. This can result in loading spinners or partially rendered pages while data is being fetched.

With a resolver, Angular pauses the navigation, retrieves the required data, and only creates the component once the data is available.

### Navigation Without a Resolver

```text
Navigate to /products/42
        │
        ▼
Create ProductComponent
        │
        ▼
ngOnInit()
        │
        ▼
HTTP Request
        │
        ▼
Loading Spinner...
        │
        ▼
Response Arrives
        │
        ▼
Display Product
```

### Navigation With a Resolver

```text
Navigate to /products/42
        │
        ▼
Match Route
        │
        ▼
Run Resolver
        │
        ▼
HTTP Request
        │
        ▼
Receive Product
        │
        ▼
Create ProductComponent
        │
        ▼
Display Product Immediately
```

Notice that the component is **not created** until the resolver has finished.

---

## Creating a Resolver

Angular provides the `ResolveFn<T>` type for creating functional resolvers.

```typescript
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ProductService } from './product.service';

export const productResolver: ResolveFn<Product> = (route) => {
  const productService = inject(ProductService);

  return productService.getProduct(route.paramMap.get('id')!);
};
```

### How it Works

1. Angular matches the route.
2. The resolver executes.
3. The resolver fetches the required data.
4. Angular waits until the resolver completes.
5. The resolved data is attached to the route.
6. The component is created.

---

## Registering a Resolver

Attach the resolver to a route using the `resolve` property.

```typescript
export const routes: Routes = [
  {
    path: 'products/:id',
    component: ProductDetailsComponent,
    resolve: {
      product: productResolver
    }
  }
];
```

The key (`product`) becomes the property name under which the resolved data is exposed.

---

## Accessing Resolved Data

Resolved data is available through the `ActivatedRoute`.

```typescript
import { ActivatedRoute } from '@angular/router';

@Component({...})
export class ProductDetailsComponent {

  route = inject(ActivatedRoute);

  product = this.route.snapshot.data['product'];
}
```

Or reactively:

```typescript
this.route.data.subscribe(data => {
  console.log(data['product']);
});
```

---

## Multiple Resolvers

A route can execute multiple resolvers in parallel.

```typescript
{
  path: 'products/:id',
  component: ProductDetailsComponent,
  resolve: {
    product: productResolver,
    reviews: reviewsResolver,
    inventory: inventoryResolver
  }
}
```

Angular waits for **all** resolvers to complete before activating the route.

```text
Match Route
      │
      ▼
Run Product Resolver
Run Reviews Resolver
Run Inventory Resolver
      │
      ▼
Wait for all to finish
      │
      ▼
Create Component
```

---

## When Should You Use a Resolver?

Resolvers are useful when the component **cannot function correctly without certain data**.

Good use cases include:

- Product details pages
- User profiles
- Order summaries
- Dashboard configuration
- Application settings
- Permissions required before rendering

For example, navigating to `/products/42` is much smoother if the product data is already available when the page appears.

---

## When Should You Avoid a Resolver?

Resolvers are **not** appropriate for every data request.

Avoid using them for:

- Live or frequently refreshed data
- Infinite scrolling
- Background updates
- Optional content
- Data that can load after the initial page render

For example, a social media feed or a live stock ticker should continue updating after the page is displayed rather than delaying navigation.

---

## Summary

A resolver acts as a **pre-navigation data loader**.

Instead of this:

```text
Navigate
    │
    ▼
Create Component
    │
    ▼
Fetch Data
```

Angular performs this:

```text
Navigate
    │
    ▼
Resolve Data
    │
    ▼
Create Component
    │
    ▼
Render Page
```

This results in a smoother user experience because the component starts with all the data it needs, reducing loading states and simplifying component logic.