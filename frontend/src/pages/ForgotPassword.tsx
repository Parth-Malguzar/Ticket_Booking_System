import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios.ts";
import toast from "react-hot-toast";
import axios from "axios";
import validator from "validator";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validator.isEmail(email)) return toast.error("please enter a valid email")
        setIsSubmitting(true);
        const id = toast.loading("Generating link...")
        try {
            const res = await api.post("/auth/forgot-password", { email })
            toast.success(res.data.message, {
                id: id
            })
            console.log(res);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message, {
                    id: id
                })
            }
        } finally {
            setIsSubmitting(false)
        }
        console.log({ email });
    };

    return (
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)] flex items-center justify-center px-4 py-12">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-2xl shadow-black/40">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
                <div className="relative mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--app-muted)]">Recover access</p>
                    <h1 className="mt-3 text-3xl font-semibold text-[var(--app-fg)]">Forgot your password?</h1>
                    <p className="mt-2 text-sm text-[var(--app-muted)]">
                        Enter the email linked to your account and we&apos;ll send a reset link.
                    </p>
                </div>

                <form className="relative space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--app-fg)]">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3 text-[var(--app-fg)] outline-none transition-colors placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-[var(--app-accent)] px-4 py-3 font-semibold text-[var(--app-accent-fg)] transition-all hover:bg-[var(--app-accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Sending link..." : "Send reset link"}
                    </button>
                </form>

                <p className="relative mt-6 text-center text-sm text-[var(--app-muted)]">
                    Remembered your password?{" "}
                    <Link to="/login" className="font-medium text-[var(--app-fg)] hover:underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
