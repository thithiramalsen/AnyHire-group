import { Link } from 'react-router-dom';

const coreValues = [
  {
    icon: (
      <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
    ),
    title: 'Innovation',
    desc: 'We embrace new ideas and technology to make job connections smarter and easier.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5V7a4 4 0 00-8 0v2m12 4v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h12a2 2 0 012 2z" /></svg>
    ),
    title: 'Empowerment',
    desc: 'We empower both job seekers and customers to achieve their goals and grow.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm0 0V7m0 4v4m0 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
    title: 'Integrity',
    desc: 'We build trust through transparency, fairness, and reliability in every interaction.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v4m0 8v4m8-8h-4m-8 0H4" /></svg>
    ),
    title: 'Community',
    desc: 'We foster a supportive, local community where everyone can thrive.'
  }
];

const impactStats = [
  { label: 'Users', value: 12000 },
  { label: 'Jobs Posted', value: 8500 },
  { label: 'Connections', value: 20000 },
  { label: 'Cities', value: 30 }
];

const team = [
  {
    img: '/src/assets/user1.jpeg',
    name: 'Thithira Malsen',
    role: 'CEO',
    desc: 'Visionary leader passionate about empowering communities and redefining work.'
  },
  {
    img: '/src/assets/user2.jpeg',
    name: 'Thiranja Bandara',
    role: 'Founder',
    desc: 'Driven to create innovative solutions and connect people to opportunities.'
  },
  {
    img: '/src/assets/user3.jpeg',
    name: 'Mashi Waidyarathne',
    role: 'Community Lead',
    desc: 'Focused on building a strong, supportive user community.'
  },
  {
    img: '/src/assets/user4.jpeg',
    name: 'Tharusha Bandara',
    role: 'Head of Product',
    desc: 'Dedicated to delivering the best experience for both job seekers and customers.'
  }
];

const AboutUs = () => {
  return (
    <div className="bg-gray-900 min-h-screen pt-24 pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-left bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl">
            Empowering Connections, Redefining Work
          </h1>
          <div className="w-24 h-2 bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 rounded-full mb-6" />
          <p className="text-xl text-gray-200 mb-8 font-light animate-fade-in text-left">
            AnyHire connects part-time job seekers with customers in their local area, making work more accessible, flexible, and rewarding for everyone.
          </p>
          <Link
            to="/signupchoice"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105 animate-bounce"
          >
            Join AnyHire
          </Link>
        </div>
        <div className="flex-1 flex justify-center animate-float">
          <img
            src="/src/assets/hero-job-connection.jpeg"
            alt="About AnyHire banner"
            className="w-[400px] h-[400px] object-cover rounded-3xl shadow-2xl border-4 border-emerald-400 animate-fade-in"
            loading="lazy"
          />
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row gap-12 items-center relative">
        <div className="flex-1 bg-gray-800/50 rounded-2xl p-10 shadow-xl flex flex-col items-center animate-fade-in-up border-t-4 border-emerald-400">
          <img src="/src/assets/mission.jpeg" alt="Mission" className="w-28 h-28 mb-4 rounded-full object-cover border-4 border-emerald-400 animate-pop" />
          <h2 className="text-3xl font-bold mb-3 text-emerald-300">Our Mission</h2>
          <p className="text-gray-200 text-center text-lg">To bridge the gap between workers and customers, creating opportunities and building trust in every connection.</p>
        </div>
        <div className="hidden md:block w-2 h-64 bg-gradient-to-b from-emerald-400 via-green-400 to-cyan-400 rounded-full mx-8" />
        <div className="flex-1 bg-gray-800/50 rounded-2xl p-10 shadow-xl flex flex-col items-center animate-fade-in-up border-t-4 border-green-400">
          <img src="/src/assets/vision.jpeg" alt="Vision" className="w-28 h-28 mb-4 rounded-full object-cover border-4 border-green-400 animate-pop" />
          <h2 className="text-3xl font-bold mb-3 text-green-300">Our Vision</h2>
          <p className="text-gray-200 text-center text-lg">To transform the part-time job market by making flexible work accessible, reliable, and rewarding for all.</p>
        </div>
      </section>

      {/* Core Values Timeline */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-14 text-emerald-400 animate-fade-in">Our Core Values</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative">
          <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 opacity-40 z-0" style={{transform: 'translateY(-50%)'}} />
          {coreValues.map((val, idx) => (
            <div key={val.title} className="relative z-10 bg-gray-800/50 rounded-2xl p-8 shadow-xl flex flex-col items-center transition-transform hover:scale-105 animate-fade-in-up border-b-4 border-emerald-400" style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
              <div className="mb-4 animate-pop">{val.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-emerald-300 animate-fade-in">{val.title}</h4>
              <p className="text-gray-200 text-center animate-fade-in">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Section - Horizontal Bar with Animated Counters */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-14 text-green-400 animate-fade-in">Our Impact</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          {impactStats.map((stat, idx) => (
            <div key={stat.label} className="bg-gradient-to-br from-emerald-800/80 to-green-800/80 rounded-2xl p-10 shadow-xl flex flex-col items-center animate-fade-in-up border-b-4 border-green-400" style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
              <div className="text-5xl font-extrabold text-white mb-2 animate-pop counter" data-value={stat.value}>{stat.value.toLocaleString()}</div>
              <div className="text-lg text-green-200 font-semibold animate-fade-in">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team/Community Section - Carousel Style */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-14 text-emerald-400 animate-fade-in">Meet Our Team & Community</h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center items-center overflow-x-auto pb-4">
          {team.map((member, idx) => (
            <div key={member.name} className="bg-gradient-to-br from-gray-800/10 to-emerald-900/40 rounded-2xl p-8 shadow-2xl flex flex-col items-center min-w-[280px] max-w-xs transition-transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up border-t-4 border-emerald-400" style={{ animationDelay: `${idx * 0.15 + 0.2}s` }}>
              <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-green-400 animate-pop" />
              <h4 className="text-lg font-semibold mb-1 text-emerald-200 animate-fade-in">{member.name}</h4>
              <p className="text-green-300 text-sm mb-2 animate-fade-in">{member.role}</p>
              <p className="text-gray-200 text-center animate-fade-in">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action - Light Background */}
      <section className="container mx-auto px-4 py-20 text-center bg-gray-800/50 rounded-3xl shadow-2xl mt-20">
        <h2 className="text-4xl font-bold mb-6 text-emerald-700 animate-fade-in">Ready to join the AnyHire community?</h2>
        <p className="text-lg text-gray-700 mb-8">Sign up today and be part of a movement that's changing the way people work and connect.</p>
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
          <Link
            to="/signupchoice"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105 animate-bounce"
          >
            Sign Up Now
          </Link>
          <Link
            to="/post-job"
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform shadow-2xl hover:scale-105 animate-bounce"
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

export default AboutUs; 