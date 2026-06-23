import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../lib/axios";

const VerifyEmail = () => {
    const { token } = useParams();//extract token from url
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState<"ok" | "vendor-pending" | "already" | "error" | null>(null);

    const verifyEmail = async () => {
        if (!token) {
            setStatus("error");
            toast.error("Verification token is missing.");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await api.post(`/auth/verify-email`, { token });
            const responseStatus = res?.data?.status;

            if (responseStatus === "ok" && res?.data?.user) {
                toast.success("Email verified. Please log in.");
                setStatus("ok");
                setTimeout(() => {
                    navigate("/login", { replace: true, state: { fromVerification: true } });
                }, 1200);
                return;
            }

            if (responseStatus === "vendor-pending") {
                setStatus("vendor-pending");
                toast.success("Email verified. Awaiting admin approval.");
                return;
            }

            if (responseStatus === "already") {
                setStatus("already");
                toast("Email was already verified.");
                setTimeout(() => {
                    navigate("/login", { replace: true, state: { fromVerification: true } });
                }, 1000);
                return;
            }

            setStatus("ok");
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Verification failed");
            } else if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Verification failed");
            }
            setStatus("error");
        } finally {
            setIsVerifying(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Verifying</p>
                    <h1 className="mt-3 text-3xl font-semibold text-(--app-fg)">Verifying your email...</h1>
                    <p className="mt-2 text-sm text-(--app-muted)">Please wait while we confirm your email address.</p>
                </div>
            </div>
        );
    }

    if (status === "vendor-pending") {
        return (
            <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40 text-center">
                    <h1 className="text-2xl font-semibold text-(--app-fg)">Email verified</h1>
                    <p className="mt-3 text-sm text-(--app-muted)">Your email is verified. Your vendor request is awaiting admin approval.</p>
                    <div className="mt-6">
                        <Link to="/login" className="rounded-xl bg-(--app-accent) px-4 py-2 text-(--app-accent-fg)">Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40 text-center">
                    <h1 className="text-2xl font-semibold text-(--app-fg)">Verification failed</h1>
                    <p className="mt-3 text-sm text-(--app-muted)">The verification link is invalid or expired.</p>
                    <div className="mt-6 space-x-3">
                        <Link to="/signup" className="rounded-xl border border-(--app-border) px-4 py-2">Signup</Link>
                        <Link to="/forgot-password" className="rounded-xl bg-(--app-accent) px-4 py-2 text-(--app-accent-fg)">Resend verification</Link>
                    </div>
                </div>
            </div>
        );
    }

    // default success (should redirect quickly)
    return (
        <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40 text-center">
                <h1 className="text-2xl font-semibold text-(--app-fg)">Email verified</h1>
                <p className="mt-3 text-sm text-(--app-muted)">Click the button below to verify your email.</p>
                <button
                    type="button"
                    onClick={verifyEmail}
                    className="mt-6 rounded-xl bg-(--app-accent) px-4 py-2 text-(--app-accent-fg)"
                >
                    Verify Email
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;
