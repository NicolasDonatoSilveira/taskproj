import React, { useRef, useEffect } from "react";

/**
 * Generic reusable modal for forms.
 * Props:
 * - title: modal title
 * - fields: array of objects describing the form fields
 * - values: object with the field values
 * - setValues: function to update field values
 * - onSubmit: function called on form submit
 * - onClose: function called when closing/cancelling the modal
 * - submitLabel: submit button text (default: "Create")
 * - hideCancel: if true, hides the Cancel button
 * - backdropClass: Tailwind classes for the modal backdrop
 */
const CreateModal = ({
    title,
    fields,
    values,
    setValues,
    onSubmit,
    onClose,
    submitLabel = "Create",
    hideCancel = false,
    backdropClass = "bg-slate-950/20"
}) => {

    // Ref to automatically focus the first input field
    const firstInputRef = useRef(null);

    useEffect(() => {
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);

    // Generates a unique id for each field (used in label/input)
    const getFieldId = (field) => `modal-field-${field.name}`;

    return (
        <div
            className={`fixed inset-0 ${backdropClass} flex items-center justify-center z-50`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="bg-slate-50 rounded shadow-lg w-full max-w-md p-6 border-slate-300 border">
                {/* Modal title */}
                <h3
                    id="modal-title"
                    className="text-xl mb-4 text-center font-inter-bold text-slate-700 pb-4 border-b border-slate-200"
                >
                    {title}
                </h3>
                {/* Dynamic form */}
                <form onSubmit={onSubmit} autoComplete="off" className="space-y-3">
                    {fields.map((field, idx) => (
                        <div key={field.name} className="mb-2">
                            {/* Accessible label */}
                            <label
                                htmlFor={getFieldId(field)}
                                className="block text-slate-700 mb-1 font-inter-medium"
                            >
                                {field.placeholder}
                                {field.required && <span className="text-blue-400"> *</span>}
                            </label>
                            {/* Select or input field */}
                            {field.type === "select" ? (
                                <select
                                    id={getFieldId(field)}
                                    className="w-full bg-transparent p-2 border-b-3 border-slate-300 rounded-t outline-none focus:border-blue-500"
                                    value={values[field.name] || ""}
                                    onChange={e => setValues({ ...values, [field.name]: e.target.value })}
                                    required={field.required}
                                >
                                    <option value="" disabled>
                                        Select
                                    </option>
                                    {field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id={getFieldId(field)}
                                    ref={idx === 0 ? firstInputRef : undefined} // Focuses the first input
                                    type={field.type}
                                    name={field.name}
                                    className="w-full bg-transparent p-2 border-b-3 border-slate-300 rounded-t outline-none focus:border-blue-500 focus:shadow-[0_8px_12px_-8px_rgba(59,130,246,0.4)] transition-all duration-150"
                                    value={values[field.name] || ""}
                                    onChange={e => setValues({ ...values, [field.name]: e.target.value })}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    autoComplete={field.type === "password" ? "new-password" : "off"}
                                />
                            )}
                        </div>
                    ))}
                    {/* Footer with buttons */}
                    <div className={`flex ${hideCancel ? 'justify-center' : 'justify-end'} gap-2`}>
                        {/* Cancel button (optional) */}
                        {!hideCancel && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer px-4 py-2 bg-slate-400 text-slate-50 rounded hover:bg-slate-500 font-inter-bold"
                            >
                                Cancel
                            </button>
                        )}
                        {/* Submit button */}
                        <button
                            type="submit"
                            className="cursor-pointer px-4 py-2 bg-blue-500 text-slate-50 rounded font-inter-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-150"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateModal;