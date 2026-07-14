# Angular Application Structure with Standalone Components

## Overview

Angular's standalone APIs (introduced in Angular 14 and recommended from
Angular 17+) remove the need for NgModules in most applications. Instead
of organizing the application around modules, organize it around
**features**, **core services**, and **shared reusable components**.

The main goals are:

-   Feature-first organization
-   High cohesion and low coupling
-   Lazy loading by default
-   Tree-shakable architecture
-   Easy scalability
-   Simple dependency management

------------------------------------------------------------------------

# Recommended Folder Structure

``` text
src/
├── app/
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.component.ts
│   │
│   ├── core/
│   │   ├── services/
│   │   ├── interceptors/
│   │   ├── guards/
│   │   ├── layout/
│   │   └── tokens/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── features/
│   │   ├── authentication/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── settings/
│   │   └── products/
│   │
│   ├── state/
│   │
│   ├── environments/
│   └── assets/
```

------------------------------------------------------------------------

# Application Layers

## app/

Contains the application bootstrap and global configuration.

Typical files:

-   `app.config.ts`
-   `app.routes.ts`
-   `app.component.ts`

------------------------------------------------------------------------

## core/

Contains singleton objects used throughout the application.

Typical contents:

-   Authentication service
-   HTTP interceptors
-   Route guards
-   Global layout
-   Injection tokens
-   Logging
-   Error handling

Core should never contain feature-specific code.

------------------------------------------------------------------------

## shared/

Contains reusable building blocks.

Examples:

-   Buttons
-   Tables
-   Cards
-   Pipes
-   Directives
-   Helper functions
-   Interfaces

Everything inside Shared should be reusable by multiple features.

------------------------------------------------------------------------

## features/

Every business domain gets its own folder.

Example:

``` text
features/
    users/
    products/
    orders/
    administration/
```

Each feature owns:

-   pages
-   components
-   services
-   models
-   routes
-   state

This keeps features isolated.

------------------------------------------------------------------------

# Example Feature

``` text
users/
├── pages/
│   ├── user-list/
│   └── user-details/
├── components/
│   ├── user-card/
│   └── user-table/
├── services/
├── models/
├── state/
├── guards/
├── resolvers/
├── users.routes.ts
└── index.ts
```

------------------------------------------------------------------------

# Standalone Components

Every component declares its own dependencies.

``` ts
@Component({
  standalone: true,
  selector: 'app-user-card',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule
  ],
  templateUrl: './user-card.html'
})
export class UserCardComponent {}
```

Benefits:

-   Explicit dependencies
-   Better tree shaking
-   Better IDE support
-   Easier testing

------------------------------------------------------------------------

# Routing

Keep routes close to each feature.

Example:

``` ts
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list.component')
        .then(c => c.UserListComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-details/user-details.component')
        .then(c => c.UserDetailsComponent)
  }
];
```

Root routes:

``` ts
export const routes: Routes = [
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes')
        .then(r => r.USERS_ROUTES)
  }
];
```

------------------------------------------------------------------------

# Dependency Injection

Prefer:

-   `providedIn: 'root'` for global services
-   Route providers for feature-scoped services
-   Component providers only when a service instance should be isolated

Avoid global providers for feature-specific services.

------------------------------------------------------------------------


# Naming Conventions

-   Components: `UserCardComponent`
-   Services: `UserService`
-   Guards: `AuthGuard`
-   Resolvers: `UserResolver`
-   Directives: `HighlightDirective`
-   Pipes: `CurrencyPipe`

Use kebab-case for file names:

``` text
user-card.component.ts
user.service.ts
```

------------------------------------------------------------------------

# Best Practices

-   Organize by feature rather than type.
-   Keep features independent.
-   Lazy load every feature when practical.
-   Prefer standalone components, directives, and pipes.
-   Keep Core free of business logic.
-   Keep Shared generic and reusable.
-   Co-locate routes, services, models, and state with their feature.
-   Avoid circular dependencies.
-   Use route-level providers for feature-scoped services.
-   Import only the dependencies a component actually needs.

------------------------------------------------------------------------

# Summary

A modern Angular application built with standalone components should be:

-   Feature-oriented
-   Lazy-loaded
-   Tree-shakable
-   Scalable
-   Easy to navigate
-   Explicit in its dependencies
-   Simple to test
-   Organized around business domains rather than NgModules
