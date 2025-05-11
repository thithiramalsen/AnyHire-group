import { Link } from 'react-router-dom';

const steps = [
  {
    img: 'profile-setup.jpeg',
    title: 'Create a Profile',
    desc: 'Job seekers and customers can create personalized profiles to showcase skills or job needs.'
  },
  {
    img: 'job-posting.jpeg',
    title: 'Post Jobs or Services',
    desc: 'Customers can post job requirements, and workers can list their services.'
  },
  {
    img: 'search-connect.jpeg',
    title: 'Search and Connect',
    desc: 'Find the perfect match using location-based services and skill filters.'
  },
  {
    img: 'complete-job.jpeg',
    title: 'Complete the Job',
    desc: 'Workers complete tasks, and customers can provide ratings and feedback.'
  },
  {
    img: 'payment-confirmation.jpeg',
    title: 'Secure Payments',
    desc: 'Payments are secure and processed through AnyHire for peace of mind.'
  }
];

const features = [
  {
    img: 'location-services.jpeg',
    title: 'Location-Based Services',
    desc: 'Find jobs and workers near you for faster connections.'
  },
  {
    img: 'verified-profile.jpeg',
    title: 'Verified Worker Profiles',
    desc: 'All workers are verified for your safety and trust.'
  },
  {
    img: 'secure-payment.jpeg',
    title: 'Secure Payment System',
    desc: 'All payments are handled securely through AnyHire.'
  },
  {
    img: 'job-tracking.jpeg',
    title: 'Real-Time Job Tracking',
    desc: 'Track job progress and stay updated in real time.'
  },
  {
    img: 'support.jpeg',
    title: '24/7 Support',
    desc: 'Our support team is always available to help you.'
  }
];

const testimonials = [
  {
    img: 'user1.jpeg',
    name: 'Ayesha P.',
    role: 'Job Seeker',
    text: '"AnyHire helped me find flexible work quickly and easily. The process was smooth and the support team is fantastic!"'
  },
  {
    img: 'user2.jpeg',
    name: 'Ruwan S.',
    role: 'Customer',
    text: '"I posted a job and found a reliable worker within hours. The payment system is secure and gives me peace of mind."'
  },
  {
    img: 'user3.jpeg',
    name: 'Nimal F.',
    role: 'Job Seeker',
    text: '"The location-based search made it easy to find jobs near me. I love the real-time updates!"'
  }
];

const HowAnyHireWorks = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-700/40 via-cyan-700/30 to-transparent blur-3xl rounded-3xl animate-pulse-slow" />
        <div className="flex-1 animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl">
            Discover How AnyHire Simplifies Part-Time Work.
          </h1>
          <p className="text-2xl text-gray-200 mb-10 font-light animate-fade-in">
            Connecting job seekers and customers with ease.
          </p>
          <div className="flex gap-6">
            <Link
              to="/signupchoice"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105 animate-bounce"
            >
              Get Started
            </Link>
            <a
              href="#steps"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="flex-1 flex justify-center animate-float">
          <img
            src="/src/assets/hero-job-connection.jpeg"
            alt="Job connection illustration"
            className="w-[420px] h-[420px] object-cover rounded-3xl shadow-2xl border-4 border-emerald-400 animate-fade-in"
            loading="lazy"
          />
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section id="steps" className="container mx-auto px-4 py-20">
        <h2 className="text-5xl font-extrabold text-center mb-20 text-emerald-400 animate-fade-in">How It Works</h2>
        <div className="flex flex-col md:flex-row md:justify-between gap-12">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="flex-1 bg-gradient-to-br from-gray-800/90 to-gray-900/80 rounded-3xl p-10 shadow-2xl flex flex-col items-center relative group transition-transform hover:-translate-y-4 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg border-4 border-gray-900 z-10 animate-pop">
                {idx + 1}
              </div>
              <img
                src={`/src/assets/${step.img}`}
                alt={step.title}
                className="w-36 h-36 mb-6 rounded-2xl shadow-xl border-2 border-cyan-400 animate-float"
              />
              <h3 className="text-2xl font-bold mb-3 mt-8 text-cyan-300 animate-fade-in">{step.title}</h3>
              <p className="text-gray-200 text-center text-lg animate-fade-in">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-14 text-emerald-400 animate-fade-in">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 shadow-xl flex flex-col items-center transition-transform hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
            >
              <img
                src={`/src/assets/${feature.img}`}
                alt={feature.title}
                className="w-24 h-24 mb-4 rounded-xl shadow-lg border-2 border-emerald-400 animate-float"
              />
              <h4 className="text-xl font-semibold mb-2 text-emerald-300 animate-fade-in">{feature.title}</h4>
              <p className="text-gray-200 text-center animate-fade-in">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-800/30 via-emerald-800/20 to-transparent blur-2xl rounded-3xl animate-pulse-slow" />
        <h2 className="text-4xl font-bold text-center mb-14 text-emerald-400 animate-fade-in">What Our Users Say</h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
          {testimonials.map((t, idx) => (
            <div
              key={t.name}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/80 rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm transition-transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.15 + 0.2}s` }}
            >
              <img
                src={`/src/assets/${t.img}`}
                alt={t.name}
                className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-cyan-400 animate-pop"
              />
              <h4 className="text-lg font-semibold mb-1 text-cyan-200 animate-fade-in">{t.name}</h4>
              <p className="text-gray-400 text-sm mb-2 animate-fade-in">{t.role}</p>
              <p className="text-gray-200 text-center animate-fade-in">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 animate-fade-in">Ready to get started?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
          <Link
            to="/signupchoice"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105 animate-bounce"
          >
            Sign Up as a Worker
          </Link>
          <Link
            to="/post-job"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105 animate-bounce"
          >
            Post a Job
          </Link>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 1s ease-in; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(.4,0,.2,1); }
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop { animation: pop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default HowAnyHireWorks;