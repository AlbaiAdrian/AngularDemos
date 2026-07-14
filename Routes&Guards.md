
# Angular Routing & Guards (Standalone Components)

> A detailed presentation-style guide focused on modern Angular (v17+) routing using standalone APIs.

---

# Slide 1 – Agenda

- Angular Router overview
- Standalone routing
- Route configuration
- Navigation
- Parameters & query parameters
- Nested routes
- Lazy loading
- Resolvers
- Route guards
- Functional guards
- Authentication & authorization
- Best practices
- Common mistakes

---

# Slide 2 – What is the Angular Router?

The Angular Router is responsible for:

- Mapping URLs to components
- Updating the browser URL
- Managing navigation history
- Lazy loading features
- Running guards
- Resolving data before activation

Flow:

```text
Browser URL
    ↓
Angular Router
    ↓
Route Configuration
    ↓
Matched Route
    ↓
Component rendered in <router-outlet>
```

---

# Slide 3 – Why Standalone Components?

Before Angular standalone APIs:

- `AppModule`
- `RouterModule.forRoot()`
- Feature NgModules

Modern Angular:

- `bootstrapApplication()`
- `provideRouter()`
- Standalone components
- `loadComponent()`

Benefits:

- Less boilerplate
- Better tree shaking
- Smaller bundles
- Simpler lazy loading

---

# Slide 4 – Bootstrapping

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
});
```

The router is registered using dependency injection instead of `RouterModule.forRoot()`.

---

# Slide 5 – Route Configuration

```ts
export const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  {
    path: "products",
    component: ProductsComponent
  }
];
```

Important route properties:

- `path`
- `component`
- `children`
- `loadComponent`
- `loadChildren`
- `redirectTo`
- `resolve`
- `data`
- `canActivate`
- `canActivateChild`
- `canDeactivate`
- `canMatch`

---

# Slide 6 – Router Outlet

```html
<header></header>

<router-outlet></router-outlet>

<footer></footer>
```

`<router-outlet>` is the placeholder where the matched component is rendered.

---

# Slide 7 – Navigation

Template:

```html
<a routerLink="/products">Products</a>
```

Programmatic:

```ts
const router = inject(Router);

router.navigate(["/products"]);
```

---

# Slide 8 – Route Parameters

```ts
{
  path: "products/:id",
  component: ProductComponent
}
```

URL

```text
/products/42
```

Read:

```ts
const route = inject(ActivatedRoute);

route.paramMap.subscribe(params => {
  console.log(params.get("id"));
});
```

---

# Slide 9 – Query Parameters

```
/products?page=2&sort=name
```

```ts
router.navigate([], {
  queryParams: {
    page: 2,
    sort: "name"
  }
});
```

---

# Slide 10 – Nested Routes

```ts
{
  path: "settings",
  component: SettingsComponent,
  children: [
    {
      path: "profile",
      component: ProfileComponent
    }
  ]
}
```

Parent component stays mounted while child content changes.

---

# Slide 11 – Lazy Loading Standalone Components

```ts
{
  path: "settings",
  loadComponent: () =>
    import("./settings.component")
      .then(c => c.SettingsComponent)
}
```

Advantages:

- Downloads only when needed
- Faster startup
- Smaller initial bundle

---

# Slide 12 – Resolvers

Resolvers fetch data **before** the component is created.

Order:

```text
Navigation
   ↓
Resolver
   ↓
HTTP Request
   ↓
Component
```

Example:

```ts
export const productResolver: ResolveFn<Product> =
(route) => {

 const service = inject(ProductService);

 return service.get(
   route.paramMap.get("id")!
 );

};
```

---

# Slide 13 – What are Guards?

Guards decide whether navigation should continue.

They can:

- Allow navigation
- Cancel navigation
- Redirect somewhere else

---

# Slide 14 – Guard Types

| Guard | Purpose |
|-------|---------|
| CanMatch | Determines whether a route can match |
| CanActivate | Controls entry |
| CanActivateChild | Controls child routes |
| CanDeactivate | Controls exit |

Execution order:

```text
CanMatch
 ↓
CanActivateChild
 ↓
CanActivate
 ↓
Resolvers
 ↓
Component
```

---

# Slide 15 – Functional Guards

Modern Angular prefers functions.

```ts
export const authGuard: CanActivateFn = () => {

 const auth = inject(AuthService);

 return auth.loggedIn();

};
```

Advantages:

- Less boilerplate
- Uses `inject()`
- Easier to test

---

# Slide 16 – Redirect with UrlTree

```ts
export const authGuard: CanActivateFn = () => {

 const auth = inject(AuthService);
 const router = inject(Router);

 return auth.loggedIn()
   ? true
   : router.createUrlTree(["/login"]);

};
```

Returning a `UrlTree` is preferred over calling `navigate()`.

---

# Slide 17 – CanMatch

```ts
{
  path: "admin",
  loadComponent: () =>
    import("./admin.component")
      .then(c => c.AdminComponent),
  canMatch: [adminGuard]
}
```

Why?

Without CanMatch:

```text
Download bundle
 ↓
Reject
```

With CanMatch:

```text
Check permission
 ↓
Download only if allowed
```

---

# Slide 18 – CanActivateChild

```ts
{
 path: "admin",
 canActivateChild: [authGuard],
 children: [
   ...
 ]
}
```

Protects every child route without repeating guards.

---

# Slide 19 – CanDeactivate

Useful for forms.

```ts
export interface CanExit {

 canExit(): boolean;

}
```

Guard:

```ts
export const exitGuard:
CanDeactivateFn<CanExit> =
(component) => component.canExit();
```

---

# Slide 20 – Authentication Example

```ts
@Injectable({
  providedIn: "root"
})
export class AuthService {

  private authenticated = false;

  login() {
    this.authenticated = true;
  }

  isLoggedIn() {
    return this.authenticated;
  }
}
```

---

# Slide 21 – Role-Based Authorization

```ts
{
  path: "admin",
  component: AdminComponent,
  data: {
    role: "admin"
  },
  canActivate: [roleGuard]
}
```

Guard reads:

```ts
route.data["role"]
```

---

# Slide 22 – Guards vs Resolvers

| Guards | Resolvers |
|---------|-----------|
| Decide if navigation happens | Fetch data |
| Security | Initial data |
| Return bool / UrlTree | Return model |

---

# Slide 23 – Best Practices

- Use standalone APIs
- Prefer `provideRouter()`
- Prefer functional guards
- Prefer `CanMatch` for lazy routes
- Return `UrlTree`
- Keep guards lightweight
- Use resolvers for initial data
- Organize routes by feature

---

# Slide 24 – Common Mistakes

- Using `href` instead of `routerLink`
- Calling `navigate()` inside guards
- Forgetting `<router-outlet>`
- Placing wildcard route first
- Fetching heavy data inside guards
- Not lazy-loading large features

---

# Slide 25 – Summary

Modern Angular routing revolves around:

- Standalone components
- `provideRouter()`
- `loadComponent()`
- Functional guards
- `inject()`
- `CanMatch`
- Resolvers
- Lazy loading

These APIs reduce boilerplate, improve performance, and make applications easier to maintain.
