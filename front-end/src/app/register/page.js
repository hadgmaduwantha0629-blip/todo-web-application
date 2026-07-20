import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {

    return (
        <main className="page-shell">
            <div className="page-container flex min-h-[calc(100vh-3rem)] items-center justify-center">
                <RegisterForm />
            </div>
        </main>
    );

}