"use client"

import { login } from "@/services/authservices";
import { useRouter } from "next/navigation";
import { useState } from "react";
 
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

export default function LoginForm() {
    // Local form state keeps validation feedback close to the input fields.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [touched, setTouched] = useState({ email: false, password: false });
    const router = useRouter();

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

        return "";
    };

    const validateForm = (currentEmail, currentPassword) => {
        const nextErrors = {
            email: validateEmail(currentEmail),
            password: validatePassword(currentPassword),
        };

        setErrors(nextErrors);

        return !nextErrors.email && !nextErrors.password;
    };

    const handleEmailChange = (value) => {
        setEmail(value);
        setErrors((current) => ({
            ...current,
            email: validateEmail(value),
        }));
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setErrors((current) => ({
            ...current,
            password: validatePassword(value),
        }));
    };

    const handleLogin = async () => {
        // Touch both fields so empty or invalid values show immediately.
        setTouched({ email: true, password: true });

        if (!validateForm(email, password)) {
            return;
        }

        try {
            const data = await login(email, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard");

        } catch (error) {
            const message = getAuthErrorMessage(
                error,
                "We could not sign you in right now. Please check your email and password."
            );

            const responseErrors = error?.response?.data?.errors;

            if (responseErrors && typeof responseErrors === "object") {
                setErrors((current) => ({
                    ...current,
                    email:
                        (Array.isArray(responseErrors.email) && responseErrors.email[0]) ||
                        current.email,
                    password:
                        (Array.isArray(responseErrors.password) && responseErrors.password[0]) ||
                        current.password,
                }));
                return;
            }

            setErrors((current) => ({
                ...current,
                password: message,
            }));
        }
    };
    

    return(
        <section className="panel w-full max-w-md p-6 sm:p-8">
            <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Sign in to continue</h2>
                <p className="text-sm leading-6 text-slate-600">Use your account to manage todos from a clean, focused dashboard.</p>
            </div>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=> handleEmailChange(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                aria-invalid={Boolean(touched.email && errors.email)}
                className={`ui-input mt-6 ${touched.email && errors.email ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            {touched.email && errors.email ? (
                <p className="mt-2 text-sm text-rose-600">{errors.email}</p>
            ) : null}

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=> handlePasswordChange(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                aria-invalid={Boolean(touched.password && errors.password)}
                className={`ui-input mt-4 ${touched.password && errors.password ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            {touched.password && errors.password ? (
                <p className="mt-2 text-sm text-rose-600">{errors.password}</p>
            ) : null}

            <button 
                onClick={handleLogin}
                className="ui-button-primary mt-6 w-full">
                Login
            </button>

            <p className="mt-5 text-center text-sm text-slate-600">
                Don&apos;t have an account?
                <button
                    onClick={() => router.push("/register")}
                    className="ml-2 font-semibold text-slate-950 transition hover:text-slate-700"
                >
                    Register
                </button>
            </p>
        </section>
        
    );
}