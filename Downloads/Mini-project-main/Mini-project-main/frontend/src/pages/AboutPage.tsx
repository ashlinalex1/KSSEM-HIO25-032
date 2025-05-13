import { Github, Linkedin, Twitter, ExternalLink, Building2, Instagram, LineChart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StockGraph from './Graph';

function AboutPage() {
  const team = [
    {
      name: 'Ashlin Alex',
      image: '/src/assets/alex.jpeg',
      linkedin: 'https://www.linkedin.com/in/ashlin-alex-6543a629b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
      instagram: 'https://www.instagram.com/ashlin._.alex/'
    },
    {
      name: 'Anushka Patil',
      image: '/src/assets/panda.jpeg',
      linkedin: 'https://www.linkedin.com/in/anushka-patil-187244314/',
      instagram: 'https://www.instagram.com/anushka_patil917/'
    },
    
  ];

  return (
    <div className="min-h-screen text-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              About Resonate
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            Empowering job seekers with AI-driven tools. We analyze your skills, experience, and career goals in real-time to craft optimized resumes that help you stand out and land interviews faster than ever before.            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="lg:text-center">
            <Building2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            We're on a mission to democratize career growth. By leveraging cutting-edge AI to craft tailored, professional resumes, we make high-quality career tools accessible to everyone—empowering individuals to confidently pursue their dream opportunities.            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 ">
            {team.map((member) => (
              <div
                key={member.name}
                className="group bg-gray-800 rounded-lg p-6 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="rounded-full w-full h-full object-cover ring-4 ring-blue-400 group-hover:ring-emerald-400 transition-all duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4">{member.name}</h3>
                <div className="flex justify-center space-x-4">
                  <a 
                    href={member.linkedin}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href={member.instagram}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AboutPage;
