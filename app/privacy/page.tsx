import Footer from "@/components/layout/footer";
import NavBar from "@/components/layout/navbar";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
    <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
          <div className="max-w-7xl mx-auto w-full mt-10 px-5">
            <h1>Privacy Policy</h1>
            <p>Last updated: May 28, 2026</p>
            
            <hr style={{ margin: '20px 0', borderColor: '#eaeaea' }} />

            <h2>1. Information We Collect</h2>
            <p>
              When you sign in using your Google Account, we collect basic information provided by Google OAuth, including your <strong>name, email address, and profile picture</strong>.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use this information solely to create your personal user account and personalize your experience on our platform. We do not sell, rent, or distribute your personal information to third parties.
            </p>

            <h2>3. Data Storage and Security</h2>
            <p>
              Your user profile data is securely stored and managed using Supabase. We implement standard security practices to protect your information from unauthorized access.
            </p>

            <h2>4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, you can reach out to us at <Link href="mailto:acecards.dev@gmail.com" className="font-bold hover:text-slate-600">acecards.dev@gmail.com</Link>.
            </p>
          </div>
      </div>
    <Footer/>
    </>
  );
}