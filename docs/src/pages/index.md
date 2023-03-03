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
        <div>Date</div>
        <input
            type="text"
            name="date"
            mask="99/99/9999"
            placeholder="MM/DD/YYYY"
            required
        />
    </label>
    <label>
        <div>Message</div>
        <textarea name="message" rows="5" required></textarea>
    </label>
    <button type="submit">Submit</button>
</form>

<script>
    const { Form, Textbox } = window.mnmo;

    const form = new Form('form', {
        async onSubmit(form) {
            console.log(form);
        }
    })

    form.append(
        new Textbox('[name=date]', {
            valueAs: (value) => new Date(value)
        }),
        new Textbox('[name=message]')
    )
</script>
