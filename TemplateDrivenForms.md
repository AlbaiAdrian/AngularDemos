# Angular Template-Driven Forms

## Overview

Template-driven forms are Angular's declarative approach to building
forms. Instead of defining the form model in TypeScript, most of the
form configuration lives directly in the HTML template using Angular
directives.

They are best suited for:

-   Simple to moderately complex forms
-   Rapid development
-   CRUD applications
-   Forms where validation logic is relatively straightforward

For large, highly dynamic, or complex forms, Reactive Forms are
generally preferred.

------------------------------------------------------------------------

# Core Concepts

Template-driven forms are built around three main ideas:

1.  Angular automatically creates the form model.
2.  The template describes the form structure.
3.  Two-way data binding synchronizes the model and the UI.

Unlike Reactive Forms, you do **not** manually create `FormGroup` and
`FormControl` instances.

------------------------------------------------------------------------

# Importing FormsModule

Before template-driven forms can be used, import `FormsModule`.

``` ts
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [FormsModule]
})
export class AppModule {}
```

For standalone components:

``` ts
@Component({
  standalone: true,
  imports: [FormsModule]
})
export class UserComponent {}
```

------------------------------------------------------------------------

# ngForm

Whenever Angular sees a `<form>` element and `FormsModule` is imported,
it automatically creates an `NgForm` directive.

``` html
<form #userForm="ngForm">
```

`userForm` is an instance of `NgForm`.

It contains:

-   value
-   valid
-   invalid
-   dirty
-   touched
-   controls
-   reset()

Example:

``` html
<form #userForm="ngForm">

  <input
      name="firstName"
      ngModel>

</form>

<p>{{ userForm.value | json }}</p>
```

Result:

``` json
{
  "firstName": "John"
}
```

------------------------------------------------------------------------

# ngModel

`ngModel` is the heart of template-driven forms.

It:

-   Creates a FormControl
-   Connects the control to the HTML element
-   Synchronizes the component model and the view

Example:

``` ts
export class UserComponent {
  user = {
    firstName: '',
    age: 0
  };
}
```

``` html
<input
    name="firstName"
    [(ngModel)]="user.firstName">

<input
    type="number"
    name="age"
    [(ngModel)]="user.age">
```

Whenever the input changes:

-   UI updates the model
-   Model updates the UI

This is two-way data binding.

------------------------------------------------------------------------

# Why the name Attribute Matters

Every control inside a form must have a unique `name`.

``` html
<input
    name="email"
    ngModel>
```

Without it:

``` html
<input ngModel>
```

Angular throws an error because it cannot register the control with the
parent `NgForm`.

------------------------------------------------------------------------

# Two-Way Data Binding

``` html
<input
    name="username"
    [(ngModel)]="user.username">
```

Equivalent to:

``` html
<input
    [ngModel]="user.username"
    (ngModelChange)="user.username = $event">
```

------------------------------------------------------------------------

# Validation

Angular automatically attaches validators.

Required:

``` html
<input
    name="email"
    ngModel
    required>
```

Minimum length:

``` html
<input
    name="password"
    ngModel
    minlength="8">
```

Pattern:

``` html
<input
    name="zip"
    ngModel
    pattern="[0-9]{5}">
```

Email:

``` html
<input
    name="email"
    ngModel
    email>
```

Displaying errors:

``` html
<input
    name="email"
    required
    email
    ngModel
    #email="ngModel">

<div *ngIf="email.invalid && email.touched">
    Invalid email
</div>
```

------------------------------------------------------------------------

# Form State

Angular tracks several useful states.

  Property    Meaning
  ----------- ----------------------
  valid       All controls valid
  invalid     At least one invalid
  dirty       User changed value
  pristine    Never modified
  touched     Lost focus
  untouched   Never blurred

Example:

``` html
<button [disabled]="userForm.invalid">
    Save
</button>
```

------------------------------------------------------------------------

# Accessing Individual Controls

``` html
<input
    name="username"
    ngModel
    #username="ngModel">
```

``` html
<p>{{ username.valid }}</p>
<p>{{ username.errors | json }}</p>
```

------------------------------------------------------------------------

# Submitting a Form

``` html
<form
    #userForm="ngForm"
    (ngSubmit)="save(userForm)">
```

Component:

``` ts
save(form: NgForm) {
    console.log(form.value);
}
```

`form.value` might be:

``` json
{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com"
}
```

------------------------------------------------------------------------

# Resetting

``` ts
save(form: NgForm) {
    // save...

    form.resetForm();
}
```

This resets values and form state (`pristine`, `untouched`, etc.).

------------------------------------------------------------------------


# Code Example

One of the biggest advantages of template-driven forms is that you can
access both the entire form and each individual control.

## Component

``` ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user.component.html'
})
export class UserComponent {

  user = {
    firstName: '',
    lastName: '',
    email: '',
    age: null as number | null
  };

  save(form: NgForm) {

    // Entire form value
    console.log(form.value);

    // Specific field values
    console.log('First Name:', form.value.firstName);
    console.log('Last Name:', form.value.lastName);
    console.log('Email:', form.value.email);
    console.log('Age:', form.value.age);

    // Access the FormControl instance
    const firstNameControl = form.controls['firstName'];

    console.log(firstNameControl.value);
    console.log(firstNameControl.valid);
    console.log(firstNameControl.invalid);
    console.log(firstNameControl.touched);
    console.log(firstNameControl.dirty);
    console.log(firstNameControl.errors);

    form.resetForm();
  }
}
```

## Template

``` html
<form #userForm="ngForm" (ngSubmit)="save(userForm)">

  <label>First Name</label>
  <input
      type="text"
      name="firstName"
      required
      minlength="3"
      [(ngModel)]="user.firstName"
      #firstName="ngModel">

  <div *ngIf="firstName.invalid && firstName.touched">
      First name must contain at least 3 characters.
  </div>

  <label>Last Name</label>
  <input
      type="text"
      name="lastName"
      [(ngModel)]="user.lastName">

  <label>Email</label>
  <input
      type="email"
      name="email"
      required
      email
      [(ngModel)]="user.email"
      #email="ngModel">

  <div *ngIf="email.invalid && email.touched">
      Invalid email address.
  </div>

  <label>Age</label>
  <input
      type="number"
      name="age"
      [(ngModel)]="user.age">

  <button [disabled]="userForm.invalid">
      Submit
  </button>

</form>
```

## Getting Values from the Form

There are three common ways to obtain the value of a field.

### 1. From the model (recommended)

``` ts
console.log(this.user.firstName);
```

Because `[(ngModel)]` keeps the component and the view synchronized,
this value is always up to date.

### 2. From the form value object

``` ts
save(form: NgForm) {
    console.log(form.value.firstName);
}
```

`form.value` is simply an object whose keys are the `name` attributes of
each control.

``` ts
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 32
}
```

### 3. From the FormControl

``` ts
const control = form.controls['firstName'];

console.log(control.value);
console.log(control.valid);
console.log(control.errors);
```

This is useful when you need both the value and metadata (validation
state, errors, touched, dirty, etc.).

## Accessing a Control in the Template

You can export the `NgModel` directive into a template reference
variable.

``` html
<input
    name="firstName"
    [(ngModel)]="user.firstName"
    #firstName="ngModel">
```

Now you can inspect the control directly:

``` html
<p>Value: {{ firstName.value }}</p>
<p>Valid: {{ firstName.valid }}</p>
<p>Dirty: {{ firstName.dirty }}</p>
<p>Touched: {{ firstName.touched }}</p>
<p>Errors: {{ firstName.errors | json }}</p>
```

This is especially useful for displaying validation messages without
writing additional TypeScript.
