---
layout: ../layouts/Layout.astro
title: Home
subtitle: This is a test page!
---

## Test component

This is a test documentation explanation. It's pretty long. Or not.

```html
<p>This is a test codeblock!</p>
```

<form>
    <label>
        <div>Email</div>
        <input
            type="email"
            name="email"
            validation-message="Please use a valid email address."
            required
        />
    </label>
    <button type="submit">Submit</button>
</form>

<script>
    const { Form, Textbox } = window.mnmo;

    const form = new Form(document.querySelector('form'), {
        async onSubmit(form) {
            console.log(form);
        }
    })

    form.append(
        new Textbox(form.element.querySelector('[name=email]'))
    )
</script>
