---
layout: ../layouts/Layout.astro
title: Home
subtitle: This is a test page!
---

## Tabs

<section id="example-tabs">
    <div role="tablist">
        <button role="tab">
            <span class="tab-focus">Red</span>
        </button> 
        <button role="tab">
            <span class="tab-focus">Green</span>
        </button> 
        <button role="tab">
            <span class="tab-focus">Blue</span>
        </button> 
    </div>
    <div role="tabpanel">
        Red red red.
    </div>
    <div role="tabpanel">
        Green green green.
    </div>
    <div role="tabpanel">
        Blue blue blue.
    </div>
</section>

<script>
    const { Tabs } = window.mnmo;

    const tabs = new Tabs('#example-tabs', {
        onSelect(tabs) {
            if (Math.random() > 0.5) {
                tabs.preventSelection();
                console.log('You shall not select!');
            }
        }
    });

    console.log(tabs);
</script>

## Form/Inputs

<form name="test">
    <label class="input">
        <div>Zip</div>
        <input
            type="text"
            name="zip"
        />
    </label>
    <br />
    <button type="submit">Submit</button>
</form>

<script>
    function updateFormErrors(form) {
        if (!form.isSubmitted) return;

        form.inputs.forEach((input) => {
            const container = input.element.closest(".input");
            let errorElement;

            if (container.querySelector(".input__error")) {
                errorElement = container.querySelector(".input__error");
            } else {
                errorElement = document.createElement("small");
                errorElement.classList.add("input__error");
                errorElement.setAttribute("aria-live", "polite");
            }

            if (!input.error || input.error.length == 0) {
                errorElement.remove();
                return;
            }

            errorElement.textContent = input.error;
            container.append(errorElement);
        });
    }

    function handleFormValidation(form, jumpToError) {
        updateFormErrors(form);
        if (form.isValid || !jumpToError) return;
    }
    
    const { Form, Textbox, Select, RadioGroup, CheckboxGroup, Checkbox } = window.mnmo;

    const form = new Form('form[name=test]', {
        async onSubmit(form) {
            console.log(form);
        },

        onInvalid(form) {
            handleFormValidation(form)
        }
    })

    form.append([
        new Textbox('[name=zip]', {
            required: true,
            validationMessage: 'A ZIP code is required.',
        })
    ])

    console.log(form);
</script>
