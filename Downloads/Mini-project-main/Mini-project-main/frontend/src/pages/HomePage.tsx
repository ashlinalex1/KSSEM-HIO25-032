import { 
  Sparkles, 
  Brain, 
  MessageSquareText,
  ArrowRight,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react';

function HomePage() {
  const [email, setEmail] = useState("");
  const [stock, setStock] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch("http://127.0.0.1:5001/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_email: email, stock_name: stock }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alert("Thanks for subscribing!");
        setEmail("");
        setStock("");
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            Ai-Powered Resume Builder
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
            Empowering job seekers with AI-driven tools. We analyze your skills, experience, and career goals in real-time to craft optimized resumes that help you stand out and land interviews faster than ever before.
          </p>
          <Link to="/chat">
            <button className="mt-8 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold flex items-center mx-auto group">
                Try Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
{/* Upload Resume Section */}
<section className="py-24 bg-gray-800/50">
  <div className="max-w-3xl mx-auto px-4 text-center">
    <h2 className="text-3xl font-bold mb-6">Upload Your Resume</h2>
    <p className="text-gray-400 mb-8">
      Upload your existing resume in PDF or DOCX format to enhance it with AI-driven optimization.
    </p>
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-700 border-gray-600 hover:bg-gray-600 transition"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16V4a2 2 0 012-2h6a2 2 0 012 2v12m-6 4h6m-6 0H7m6 0a2 2 0 100-4 2 2 0 000 4z"
              ></path>
            </svg>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PDF, DOCX up to 5MB</p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const uploadedFile = e.target.files[0];
                console.log(uploadedFile);
                alert(`Uploaded file: ${uploadedFile.name}`);
              }
            }}
          />
        </label>
      </div>
    </form>
  </div>
</section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Skill Analysis</h3>
              <p className="text-gray-400">Real-time analysis of your skills and experience to highlight your strengths.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pre-Optimized Resumes</h3>
              <p className="text-gray-400">Generate optimized resumes that highlight your strengths and match your career goals.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquareText className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Language Q&A</h3>
              <p className="text-gray-400">Ask questions about your career goals in plain English and get detailed explanations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section id="demo" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-xl overflow-hidden border border-gray-800">
            <img 
              src="https://img.freepik.com/free-photo/business-job-interview-concept_1421-77.jpg?t=st=1745337288~exp=1745340888~hmac=de22eb44741e176f404fe3a4abb79d8bc1ad8c8fdaf5ae8d692625a5e0983cd8&w=1380"
              className="w-full h-[600px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Upload Your Information</h3>
                <p className="text-gray-400">Enter your work experience, education, and skills—or upload an existing resume.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">AI-Powered Resume Creation</h3>
                <p className="text-gray-400">Our AI analyzes your profile and job goals to craft a professional, ATS-friendly resume.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Download & Apply</h3>
                <p className="text-gray-400">Get a polished, tailored resume ready to download and start applying with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-900">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">Get Career Updates</h2>
        <p className="text-gray-400 text-center mb-8">
        Subscribe to receive personalized tips, job alerts, and resume improvement suggestions tailored to your career goals.
</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              Email Address
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
              placeholder="your@email.com"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;