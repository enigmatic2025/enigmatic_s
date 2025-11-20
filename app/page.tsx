import { PublicLayout } from "@/components/layouts/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Enigmatic</h1>
        <p className="text-xl text-gray-600 mb-8">
          The future is mysterious. Let's build it together.
        </p>
        <a
          href="/login"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Get Started
        </a>
      </div>
    </PublicLayout>
  );
}
