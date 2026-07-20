import LoginForm from "@/components/auth/LoginForm";


export default function LoginPage() {
    return (
        <main className="page-shell">
            <div className="page-container flex min-h-[calc(100vh-3rem)] items-center justify-center">
                <LoginForm />
            </div>
        </main>
    );
}