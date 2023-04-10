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
    <label>
      <div>Color</div> 
      <select name="color" required>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="yellow">Yellow</option>
      </select>
    </label>
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
        <div>Phone</div>
        <input
            type="tel"
            name="phone"
            mask="(999) 999-9999"
            placeholder="(999) 999-9999"
            required
        />
    </label>
    <label>
        <div>Message</div>
        <textarea name="message" rows="5" required></textarea>
    </label>
    <fieldset id="monster">
        <legend>Choose your favorite monster</legend>
        <label>
            <input type="radio" name="monster" value="kraken">
            <span>Kraken</span>
        </label>
        <label>
            <input type="radio" name="monster" value="behemoth">
            <span>Behemoth</span>
        </label>
    </fieldset>
    <fieldset id="pets">
        <legend>Pets</legend>
        <label>
            <input type="checkbox" name="pets" value="dog">
            <span>Dog</span>
        </label>
        <label>
            <input type="checkbox" name="pets" value="cat">
            <span>Cat</span>
        </label>
    </fieldset>
    <label>
        <input type="checkbox" name="terms" required>
        <span>Terms and conditions</span>
    </label>
    <br />
    <button type="submit">Submit</button>
</form>

<script>
    const { Form, Textbox, Select, RadioGroup, CheckboxGroup, Checkbox } = window.mnmo;

    const form = new Form('form[name=test]', {
        async onSubmit(form) {
            console.log(form);
        }
    })

    form.append([
        new Select('[name=color]'),

        new Textbox('[name=date]', {
            valueAs: (value) => new Date(value),
        }),

        new Textbox('[name=phone]', {
            onChange: (input) => console.log(input.value) 
        }),

        new Textbox('[name=message]'),

        new RadioGroup('#monster', { required: true }),

        new CheckboxGroup('#pets'),
        
        new Checkbox('[name=terms]'),
    ])

    console.log(form.getInput('message'));
</script>
