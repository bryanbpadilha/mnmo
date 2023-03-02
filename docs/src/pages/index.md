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
        <div>Tel</div>
        <input
            type="tel"
            name="tel"
            mask="(999) 999-9999"
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
        new Textbox(form.element.querySelector('[name=tel]'))
    )
</script>
