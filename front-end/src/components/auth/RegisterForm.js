"use client";

import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/authservices";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAuthErrorMessage(error, fallbackMessage) {
    const responseMessage = error?.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
        return responseMessage;
    }

    const validationErrors = error?.response?.data?.errors;

    if (validationErrors && typeof validationErrors === "object") {
        for (const value of Object.values(validationErrors)) {
            if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
                return value[0];
            }

            if (typeof value === "string" && value.trim()) {
                return value;
            }
        }
    }

    return fallbackMessage;
}

export default function RegisterForm() {

    const router = useRouter();
    const { pushToast } = useToast();

    // Form state stays local so validation and strength feedback update live.
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });

    const getPasswordStrength = (value) => {
        // Score the password by length, case variety, digits, and symbols.
        if (!value) {
            return { label: "Weak", value: 0, color: "bg-slate-200", text: "text-slate-500" };
        }

        const checks = [
            value.length >= 8,
            /[a-z]/.test(value),
            /[A-Z]/.test(value),
            /[0-9]/.test(value),
            /[^A-Za-z0-9]/.test(value),
        ];

        const score = checks.filter(Boolean).length;

        if (score <= 2) {
            return { label: "Weak", value: 33, color: "bg-rose-500", text: "text-rose-600" };
        }

        if (score <= 4) {
            return { label: "Medium", value: 66, color: "bg-amber-500", text: "text-amber-600" };
        }

        return { label: "Strong", value: 100, color: "bg-emerald-500", text: "text-emerald-600" };
    };

    const validateName = (value) => {
        if (!value.trim()) {
            return "Name is required.";
        }

        return "";
    };

    const validateEmail = (value) => {
        if (!value.trim()) {
            return "Email is required.";
        }

        if (!emailRegex.test(value)) {
            return "Please enter a valid email address.";
        }

        return "";
    };

    const validatePassword = (value) => {
        if (!value.trim()) {
            return "Password is required.";
        }

        if (value.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (!/[^A-Za-z0-9]/.test(value)) {
            return "Add at least one symbol like !, @, #, or $.";
        }

        return "";
    };

    const validateConfirmPassword = (value, currentPassword) => {
        if (!value.trim()) {
            return "Please confirm your password.";
        }

        if (value !== currentPassword) {
            return "Passwords do not match.";
        }

        return "";
    };

    const validateForm = (currentName, currentEmail, currentPassword, currentConfirmPassword) => {
        const nextErrors = {
            name: validateName(currentName),
            email: validateEmail(currentEmail),
            password: validatePassword(currentPassword),
            confirmPassword: validateConfirmPassword(currentConfirmPassword, currentPassword),
        };

        setErrors(nextErrors);

        return !nextErrors.name && !nextErrors.email && !nextErrors.password && !nextErrors.confirmPassword;
    };

    const handleNameChange = (value) => {
        setName(value);
        setErrors((current) => ({ ...current, name: validateName(value) }));
    };

    const handleEmailChange = (value) => {
        setEmail(value);
        setErrors((current) => ({ ...current, email: validateEmail(value) }));
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setErrors((current) => ({
            ...current,
            password: validatePassword(value),
            confirmPassword: validateConfirmPassword(confirmPassword, value),
        }));
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        setErrors((current) => ({
            ...current,
            confirmPassword: validateConfirmPassword(value, password),
        }));
    };

    const handleRegister = async () => {

        // Mark every field as touched so required-field errors show on submit.
        setTouched({ name: true, email: true, password: true, confirmPassword: true });

        if (!validateForm(name, email, password, confirmPassword)) {
            return;
        }

        try {

            await register({
                name,
                email,
                password,
                password_confirmation: confirmPassword,
            });

            pushToast({
                title: "Registration successful",
                description: "Your account was created successfully. Redirecting to login...",
                tone: "success",
            });

            window.setTimeout(() => {
                router.push("/login");
            }, 1400);

        } catch (error) {
            const message = getAuthErrorMessage(
                error,
                "We could not create your account right now. Please review the form and try again."
            );

            const responseErrors = error?.response?.data?.errors;

            if (responseErrors && typeof responseErrors === "object") {
                setErrors((current) => ({
                    ...current,
                    name: (Array.isArray(responseErrors.name) && responseErrors.name[0]) || current.name,
                    email: (Array.isArray(responseErrors.email) && responseErrors.email[0]) || current.email,
                    password:
                        (Array.isArray(responseErrors.password) && responseErrors.password[0]) || current.password,
                    confirmPassword:
                        (Array.isArray(responseErrors.password_confirmation) && responseErrors.password_confirmation[0]) ||
                        current.confirmPassword,
                }));
                return;
            }

            setErrors((current) => ({
                ...current,
                password: message,
            }));

            pushToast({
                title: "Registration failed",
                description: message,
                tone: "error",
            });

        }

    };

    return (

        <section className="panel w-full max-w-md p-6 sm:p-8">

            <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Create account</p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Register</h1>
                <p className="text-sm leading-6 text-slate-600">Set up your workspace and start tracking tasks with a clean layout.</p>
            </div>

            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                aria-invalid={Boolean(touched.name && errors.name)}
                className={`ui-input mt-6 ${touched.name && errors.name ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            {touched.name && errors.name ? <p className="mt-2 text-sm text-rose-600">{errors.name}</p> : null}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                aria-invalid={Boolean(touched.email && errors.email)}
                className={`ui-input mt-4 ${touched.email && errors.email ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            {touched.email && errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                aria-invalid={Boolean(touched.password && errors.password)}
                className={`ui-input mt-4 ${touched.password && errors.password ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            {touched.password && errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}

            <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">Password strength</span>
                    <span className={`font-semibold ${getPasswordStrength(password).text}`}>
                        {getPasswordStrength(password).label}
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                        style={{ width: `${getPasswordStrength(password).value}%` }}
                    />
                </div>

                <p className="text-xs leading-5 text-slate-500">
                    Use 8+ characters with upper and lower case letters, numbers, and a symbol like ! or @.
                </p>
            </div>

            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
                className={`ui-input mt-4 ${touched.confirmPassword && errors.confirmPassword ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            {touched.confirmPassword && errors.confirmPassword ? <p className="mt-2 text-sm text-rose-600">{errors.confirmPassword}</p> : null}

            <button
                onClick={handleRegister}
                className="ui-button-primary mt-6 w-full"
            >
                Register
            </button>

            <p className="mt-5 text-center text-sm text-slate-600">

                Already have an account?

                <button
                    onClick={()=>router.push("/login")}
                    className="ml-2 font-semibold text-slate-950 transition hover:text-slate-700"
                >
                    Login
                </button>

            </p>

        </section>

    );

}