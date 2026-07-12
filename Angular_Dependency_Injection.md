# Angular Dependency Injection: Injectors, Hierarchical DI, Tree Shaking, `providedIn`, Providers, Injection Tokens, and Multi Providers

# Table of Contents

1.  Introduction
2.  What is an Injector?
3.  How Dependency Injection Works
4.  Hierarchical Injectors
5.  Injector Resolution Algorithm
6.  Tree Shaking
7.  `@Injectable()` and `providedIn`
8.  All `providedIn` Options
9.  Providers
10. Provider Types
11. Injection Tokens
12. Multi Providers
13. Real-World Examples
14. Best Practices

# 1. Introduction

Angular uses **Dependency Injection (DI)** to create and supply objects
instead of having classes instantiate their own dependencies.

Instead of:

``` ts
const logger = new LoggerService();
```

Angular does:

``` ts
constructor(private logger: LoggerService) {}
```

Angular finds or creates the service using an **Injector**.

------------------------------------------------------------------------

# 2. What is an Injector?

An injector is a container that:

-   Stores provider definitions.
-   Creates dependency instances.
-   Caches singleton instances (when appropriate).
-   Resolves dependencies for components, directives, pipes and
    services.

Internally it behaves similarly to a map:

    LoggerService -> instance
    ApiService -> instance
    AuthService -> instance

The first time a dependency is requested, Angular creates it (if
necessary) and caches it.

------------------------------------------------------------------------

# 3. How Dependency Injection Works

Suppose:

``` ts
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private logger: LoggerService) {}
}
```

When `UserService` is requested:

1.  Angular needs `UserService`.
2.  Looks in injector.
3.  No instance exists.
4.  Creates `UserService`.
5.  Sees it requires `LoggerService`.
6.  Searches injector.
7.  Creates `LoggerService`.
8.  Injects it.
9.  Stores both instances.

Future requests reuse the cached instances.

------------------------------------------------------------------------

# 4. Hierarchical Injectors

Angular does **not** have one injector.

Instead it has a hierarchy.

    Platform Injector
            │
    Environment Injector (Root)
            │
    Lazy Module Injector (optional)
            │
    Component Injector
            │
    Child Component Injector

Each injector can have its own providers.

A child injector asks its parent if it cannot resolve a dependency.

Example:

    Root
     ├── AppComponent
     │      │
     │      ├── DashboardComponent
     │      │       │
     │      │       └── UserCardComponent
     │      │
     │      └── AdminComponent

If `UserCardComponent` requests `LoggerService`:

1.  Check UserCard injector.
2.  Check Dashboard injector.
3.  Check App injector.
4.  Check Root injector.

The first provider found wins.

## Overriding services

``` ts
@Component({
  providers: [LoggerService]
})
export class DashboardComponent {}
```

Everything under `DashboardComponent` receives a different
`LoggerService` instance.

`AdminComponent` still receives the root singleton.

This enables isolated state.

------------------------------------------------------------------------

# 5. Injector Resolution Algorithm

Angular searches upward only.

    Current injector
          ↓
    Parent
          ↓
    Parent
          ↓
    Root

It never searches downward.

If nothing is found Angular throws:

    NullInjectorError

unless the dependency is optional.

------------------------------------------------------------------------

# 6. Tree Shaking

Tree shaking removes unused JavaScript during production builds.

Example:

``` ts
@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {}
```

If `AnalyticsService` is never injected, Angular and the bundler can
eliminate it from the final bundle.

Using `providedIn` enables this optimization because the provider
metadata is attached to the service itself.

Registering providers in arrays such as `ApplicationConfig.providers` or
component `providers` cannot always be removed automatically because
Angular must preserve those registrations.

------------------------------------------------------------------------

# 7. @Injectable and providedIn

``` ts
@Injectable({
    providedIn: 'root'
})
```

This tells Angular:

-   the class is injectable
-   where it should be registered
-   allows tree shaking

------------------------------------------------------------------------

# 8. All providedIn Options

## 'root'

One singleton for the entire application.

``` ts
@Injectable({
    providedIn: 'root'
})
```

Most common choice.

------------------------------------------------------------------------

## 'platform'

Shared across multiple Angular applications running on the same page.

Useful for micro-frontends.

``` ts
@Injectable({
    providedIn: 'platform'
})
```

------------------------------------------------------------------------

## 'any'

Creates one instance per environment/lazy injector.

Lazy-loaded features receive their own instance while eagerly loaded
consumers share one from the root environment.

``` ts
@Injectable({
    providedIn: 'any'
})
```

Useful for feature isolation.

------------------------------------------------------------------------

## A specific EnvironmentInjector type

You can reference an injector-defining type.

``` ts
@Injectable({
    providedIn: SomeFeatureModule
})
```

The service becomes available from that injector.

This pattern is uncommon in modern standalone Angular.

------------------------------------------------------------------------

## null

``` ts
@Injectable({
    providedIn: null
})
```

Angular does **not** register it.

You must provide it manually.

------------------------------------------------------------------------

# 9. Providers

Providers tell Angular how to create a dependency.

Example:

``` ts
providers: [
    LoggerService
]
```

Equivalent to

``` ts
providers: [
    {
        provide: LoggerService,
        useClass: LoggerService
    }
]
```

------------------------------------------------------------------------

# 10. Provider Types

## useClass

``` ts
providers: [
{
    provide: LoggerService,
    useClass: BetterLoggerService
}
]
```

Injecting `LoggerService` returns `BetterLoggerService`.

## useValue

``` ts
providers: [
{
    provide: API_URL,
    useValue: 'https://api.example.com'
}
]
```

Provides a constant.

## useExisting

`useExisting` tells Angular to **reuse an already registered instance** instead of creating a new one.

Consider these services:

```ts
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

@Injectable({
  providedIn: 'root'
})
export class BetterLoggerService extends LoggerService {
  override log(message: string) {
    console.log(`[Better] ${message}`);
  }
}
```

Without `useExisting`:

```ts
providers: [
  BetterLoggerService,
  {
    provide: LoggerService,
    useClass: BetterLoggerService
  }
]
```

Angular creates **two different objects**:

```
BetterLoggerService  ---> Instance A
LoggerService        ---> Instance B (also BetterLoggerService)
```

Although both are of the same class, they are separate instances.

Using `useExisting`:

```ts
providers: [
  BetterLoggerService,
  {
    provide: LoggerService,
    useExisting: BetterLoggerService
  }
]
```

Angular creates only one object:

```
BetterLoggerService
        ▲
        │
LoggerService (alias)
```

Both injections return the exact same instance.

Use `useExisting` when:
- exposing a service through multiple tokens
- creating aliases
- avoiding duplicate singleton instances

## useFactory

`useFactory` allows Angular to call a function to create a dependency.

Unlike `useClass`, the returned object does not even have to be a class instance.

Example:

```ts
export function apiFactory(config: ConfigService) {
  return new ApiService(config.apiUrl);
}

providers: [
  ConfigService,
  {
    provide: ApiService,
    useFactory: apiFactory,
    deps: [ConfigService]
  }
]
```

Angular performs:

1. Resolve `ConfigService`.
2. Call `apiFactory(config)`.
3. Cache the returned value.
4. Inject it wherever `ApiService` is requested.

Factories are useful when:
- creation depends on runtime configuration
- different implementations are selected based on environment
- third-party libraries need custom initialization
- the dependency is not created with a simple constructor

Example selecting an implementation:

```ts
export function loggerFactory() {
  return isDevMode()
    ? new ConsoleLogger()
    : new RemoteLogger();
}
```

------------------------------------------------------------------------

# 11. Injection Tokens

Interfaces disappear after TypeScript compilation.

This fails:

``` ts
constructor(private config: AppConfig) {}
```

Instead:

``` ts
export interface AppConfig {
    apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
```

Provider:

``` ts
providers: [
{
    provide: APP_CONFIG,
    useValue: {
        apiUrl: 'https://api.example.com'
    }
}
]
```

Inject:

``` ts
constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig
) {}
```

Use injection tokens for:

-   interfaces
-   configuration
-   primitive values
-   plugin systems

------------------------------------------------------------------------

# 12. Multi Providers

Create a common interface:

```ts
export interface NotificationHandler {
  send(message: string): void;
}
```

Implement multiple classes:

```ts
@Injectable()
export class EmailHandler implements NotificationHandler {
  send(message: string) {
    console.log('Email:', message);
  }
}

@Injectable()
export class SmsHandler implements NotificationHandler {
  send(message: string) {
    console.log('SMS:', message);
  }
}

@Injectable()
export class PushHandler implements NotificationHandler {
  send(message: string) {
    console.log('Push:', message);
  }
}
```

Create an injection token:

```ts
export const NOTIFICATION_HANDLERS =
  new InjectionToken<NotificationHandler[]>(
    'NOTIFICATION_HANDLERS'
  );
```

Register every implementation:

```ts
providers: [
  EmailHandler,
  SmsHandler,
  PushHandler,

  {
    provide: NOTIFICATION_HANDLERS,
    useExisting: EmailHandler,
    multi: true
  },
  {
    provide: NOTIFICATION_HANDLERS,
    useExisting: SmsHandler,
    multi: true
  },
  {
    provide: NOTIFICATION_HANDLERS,
    useExisting: PushHandler,
    multi: true
  }
]
```

Inject them:

```ts
constructor(
  @Inject(NOTIFICATION_HANDLERS)
  private handlers: NotificationHandler[]
) {}
```

Angular injects:

```ts
[
  EmailHandler,
  SmsHandler,
  PushHandler
]
```

Executing all handlers:

```ts
this.handlers.forEach(handler =>
  handler.send('System maintenance tonight')
);
```

This pattern is the foundation for Angular's own extensibility mechanisms such as:

- HTTP interceptors
- validators
- application initializers
- router features

The important detail is the combination of **`multi: true`** and **`useExisting`**. Each handler remains a singleton service, while the token exposes an array containing references to those existing instances. If `useClass` were used instead, Angular would create additional instances for the multi-provider registrations.

------------------------------------------------------------------------

# 13. Best Practices

-   Prefer `providedIn: 'root'` for application-wide singleton services.
-   Use component `providers` only when each component subtree needs
    isolated state.
-   Use `InjectionToken` for interfaces, primitives, and configuration
    objects.
-   Use `multi: true` for extensibility patterns such as plugins and
    interceptors.
-   Prefer `useExisting` when aliasing services to avoid duplicate
    instances.
-   Use `useFactory` when creation depends on runtime information.
-   Avoid manually creating service instances with `new`; let Angular
    manage lifecycle and dependencies.

------------------------------------------------------------------------

