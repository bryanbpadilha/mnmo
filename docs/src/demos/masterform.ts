import {
    Form,
    Textbox,
    Select,
    RadioGroup,
    CheckboxGroup,
    Checkbox,
    Combobox,
    FileInput,
} from "../mnmo";

export function initMasterFormDemo() {
    const section1El = document.getElementById(
        "mf-section-1"
    ) as HTMLFormElement;
    const section2El = document.getElementById(
        "mf-section-2"
    ) as HTMLFormElement;

    // Controls
    const btnToggle1 = document.getElementById(
        "mf-toggle-1"
    ) as HTMLButtonElement;
    const btnToggle2 = document.getElementById(
        "mf-toggle-2"
    ) as HTMLButtonElement;
    const btnMasterSubmit = document.getElementById(
        "mf-master-submit"
    ) as HTMLButtonElement;

    // Output
    const logEl = document.getElementById("log-master") as HTMLElement;
    const indicator1 = document.getElementById("mf-indicator-1") as HTMLElement;
    const indicator2 = document.getElementById("mf-indicator-2") as HTMLElement;

    if (!section1El || !section2El) return;

    let form1: Form | null = null;
    let form2: Form | null = null;

    // --- Helper to build Form 1 (Identity) ---
    const buildForm1 = () => {
        const form = new Form(section1El, { onInput: updateUI });

        const username = new Textbox(
            section1El.querySelector('[name="username"]') as HTMLInputElement,
            {
                required: true,
                minLength: {
                    value: 3,
                    message: "Name must be at least 3 chars long",
                },
            }
        );

        const countryTrigger = section1El.querySelector(
            "#mf-country-trigger"
        ) as HTMLElement;
        const country = new Combobox(countryTrigger, {
            required: { value: true, message: "Please select a country" },
        });

        const genderEl = section1El.querySelector(
            "#mf-gender-group"
        ) as HTMLElement;
        const gender = new RadioGroup(genderEl, {
            required: { value: true, message: "Gender is required" },
        });

        form.append(username, country, gender);
        return form;
    };

    // --- Helper to build Form 2 (Job Application) ---
    const buildForm2 = () => {
        const form = new Form(section2El, { onInput: updateUI });

        const department = new Select(
            section2El.querySelector(
                '[name="department"]'
            ) as HTMLSelectElement,
            {
                required: { value: true, message: "Select a department" },
            }
        );

        const years = new Textbox(
            section2El.querySelector('[name="years"]') as HTMLInputElement,
            {
                min: 0,
                max: { value: 50, message: "Experience limited to 50 years" },
            }
        );

        const skillsEl = section2El.querySelector(
            "#mf-skills-group"
        ) as HTMLElement;
        const skills = new CheckboxGroup(skillsEl, {
            required: { value: true, message: "Select at least one skill" },
        });

        const resume = new FileInput(
            section2El.querySelector('[name="resume"]') as HTMLInputElement,
            {
                required: { value: true, message: "Resume file is required" },
            }
        );

        const terms = new Checkbox(
            section2El.querySelector('[name="terms"]') as HTMLInputElement,
            {
                required: { value: true, message: "You must accept terms" },
            }
        );

        form.append(department, years, skills, resume, terms);
        return form;
    };

    // --- Helper: Native Data Extraction (Fallback) ---
    const getNativeData = (formEl: HTMLFormElement) => {
        const formData = new FormData(formEl);
        const values: Record<string, any> = {};

        const keys = Array.from(formData.keys());
        const uniqueKeys = new Set(keys);

        uniqueKeys.forEach((key) => {
            const allValues = formData.getAll(key);
            values[key] = allValues.length > 1 ? allValues : allValues[0];
        });

        return values;
    };

    // --- Helper: Native Validation Logic (Fallback) ---
    const getNativeValidation = (formEl: HTMLFormElement) => {
        const isValid = formEl.checkValidity();
        return isValid
            ? "Valid (Native Check - No Rules Found)"
            : "Invalid (Native Check)";
    };

    // --- Update UI ---
    const updateUI = () => {
        btnToggle1.textContent = form1 ? "Destroy Form 1" : "Initialize Form 1";
        btnToggle2.textContent = form2 ? "Destroy Form 2" : "Initialize Form 2";

        indicator1.textContent = form1 ? "Active (MNMO)" : "Inactive";
        indicator1.className = form1 ? "status-active" : "status-destroyed";

        indicator2.textContent = form2 ? "Active (MNMO)" : "Inactive";
        indicator2.className = form2 ? "status-active" : "status-destroyed";

        if (form1 || form2) {
            const data = {
                section1: form1 ? form1.values : getNativeData(section1El),
                section2: form2 ? form2.values : getNativeData(section2El),
            };

            const meta = {
                source1: form1 ? "MNMO Class" : "Native (Limited)",
                source2: form2 ? "MNMO Class" : "Native (Limited)",
            };
            logEl.textContent = JSON.stringify({ ...meta, ...data }, null, 2);
        }
    };

    // --- Toggle Logic ---
    const toggleForm1 = () => {
        if (form1) {
            form1.destroy();
            form1 = null;
        } else {
            form1 = buildForm1();
        }
        updateUI();
    };

    const toggleForm2 = () => {
        if (form2) {
            form2.destroy();
            form2 = null;
        } else {
            form2 = buildForm2();
        }
        updateUI();
    };

    // --- Master Submit Logic ---
    const handleMasterSubmit = () => {
        logEl.textContent = "Processing Master Submit...\n";

        // Logic for Section 1
        let results1;
        if (form1) {
            // ACTIVE: Use JS Logic
            results1 = {
                mode: "Active (MNMO)",
                values: form1.values,
                status: form1.isValid ? "Valid" : form1.errors,
            };
        } else {
            // INACTIVE: Use Native Logic
            results1 = {
                mode: "Inactive (Native)",
                values: getNativeData(section1El),
                status: getNativeValidation(section1El),
            };
        }

        // Logic for Section 2
        let results2;
        if (form2) {
            // ACTIVE: Use JS Logic
            results2 = {
                mode: "Active (MNMO)",
                values: form2.values,
                status: form2.isValid ? "Valid" : form2.errors,
            };
        } else {
            // INACTIVE: Use Native Logic
            results2 = {
                mode: "Inactive (Native)",
                values: getNativeData(section2El),
                status: getNativeValidation(section2El),
            };
        }

        // Helper to check validity safely
        const isValidStatus = (status: string | Record<string, string>) => {
            if (typeof status === "string") {
                return status === "Valid" || status.startsWith("Valid");
            }
            // If it's an object, it's a map of errors
            return Object.keys(status).length === 0;
        };

        const isS1Valid = isValidStatus(results1.status);
        const isS2Valid = isValidStatus(results2.status);

        const globalStatus = isS1Valid && isS2Valid ? "SUCCESS" : "FAILURE";

        const report = {
            section1: results1,
            section2: results2,
            globalStatus,
        };

        logEl.textContent = JSON.stringify(report, null, 2);
    };

    // Listeners
    btnToggle1.addEventListener("click", toggleForm1);
    btnToggle2.addEventListener("click", toggleForm2);
    btnMasterSubmit.addEventListener("click", handleMasterSubmit);

    // Initial Render
    updateUI();
}
