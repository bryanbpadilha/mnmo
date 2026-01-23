import { Form, Textbox } from "../mnmo";

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

        // Programmatic Validation:
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

        form.append(username);
        return form;
    };

    // --- Helper to build Form 2 (Job) ---
    const buildForm2 = () => {
        const form = new Form(section2El, { onInput: updateUI });

        const department = new Textbox(
            section2El.querySelector('[name="department"]') as HTMLInputElement,
            {
                required: { value: true, message: "Department is required" },
            }
        );

        const years = new Textbox(
            section2El.querySelector('[name="years"]') as HTMLInputElement,
            {
                min: 0,
                max: { value: 50, message: "Experience limited to 50 years" },
            }
        );

        form.append(department, years);
        return form;
    };

    // --- Helper: Native Data Extraction (Fallback) ---
    const getNativeData = (formEl: HTMLFormElement) => {
        const formData = new FormData(formEl);
        const values: Record<string, any> = {};
        formData.forEach((value, key) => {
            values[key] = value;
        });
        return values;
    };

    // --- Helper: Native Validation Logic (Fallback) ---
    // Note: Since our HTML has no 'required' attributes (they are added by JS),
    // this will likely return Valid/Empty unless the user manually added attributes to HTML.
    const getNativeValidation = (formEl: HTMLFormElement) => {
        const isValid = formEl.checkValidity();
        return isValid ? "Valid (Native Check)" : "Invalid (Native Check)";
    };

    // --- Update UI ---
    const updateUI = () => {
        btnToggle1.textContent = form1 ? "Destroy Form 1" : "Initialize Form 1";
        btnToggle2.textContent = form2 ? "Destroy Form 2" : "Initialize Form 2";

        indicator1.textContent = form1
            ? "Active (MNMO Validation)"
            : "Inactive (Native DOM)";
        indicator1.className = form1 ? "status-active" : "status-destroyed";

        indicator2.textContent = form2
            ? "Active (MNMO Validation)"
            : "Inactive (Native DOM)";
        indicator2.className = form2 ? "status-active" : "status-destroyed";

        if (form1 || form2) {
            const data = {
                section1: form1 ? form1.values : getNativeData(section1El),
                section2: form2 ? form2.values : getNativeData(section2El),
            };
            // Add a note about the source
            const meta = {
                source1: form1 ? "MNMO Class" : "Native FormData",
                source2: form2 ? "MNMO Class" : "Native FormData",
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
        const results1 = form1
            ? {
                  type: "MNMO Class",
                  values: form1.values,
                  status: form1.isValid ? "Valid" : form1.errors,
              }
            : {
                  type: "Native DOM",
                  values: getNativeData(section1El),
                  status: getNativeValidation(section1El),
              };

        // Logic for Section 2
        const results2 = form2
            ? {
                  type: "MNMO Class",
                  values: form2.values,
                  status: form2.isValid ? "Valid" : form2.errors,
              }
            : {
                  type: "Native DOM",
                  values: getNativeData(section2El),
                  status: getNativeValidation(section2El),
              };

        const globalStatus =
            (results1.status === "Valid" ||
                (results1.type === "Native DOM" &&
                    section1El.checkValidity())) &&
            (results2.status === "Valid" ||
                (results2.type === "Native DOM" && section2El.checkValidity()))
                ? "SUCCESS"
                : "FAILURE";

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
