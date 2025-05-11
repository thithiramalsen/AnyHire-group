import { Link } from "react-router-dom";
import { Briefcase, UserPlus, ArrowRight, Facebook, Instagram, Shield } from "lucide-react";
import ContactForm from '../Components/Support/ContactForm';
import { useEffect, useRef } from 'react';

const services = [
  { name: 'Plumbing Services', img: '/src/homeimages/plumbing.jpeg' },
  { name: 'Electrical Services', img: '/src/homeimages/elec.jpeg' },
  { name: 'Carpentry Services', img: '/src/homeimages/carpent.jpeg'},
  { name: 'Painting Services', img: '/src/homeimages/paint.jpeg' },
  { name: 'Cleaning Services', img: '/src/homeimages/clean.jpeg' },
  { name: 'Bike Services', img: '/src/homeimages/bikeservice.jpeg' },
  { name: 'Computer Services', img: '/src/homeimages/comp.jpeg' },
  { name: 'CCTV Services', img: '/src/homeimages/cctv.jpeg' },
  { name: 'Car Services', img: '/src/homeimages/carser.jpeg' },
  { name: 'Solar Services', img: '/src/homeimages/solar.jpeg' },
];

const carouselImages = [
  '/src/homeimages/1.jpg',
  '/src/homeimages/2.jpg',
  '/src/homeimages/3.jpg',
  '/src/homeimages/4.jpg',
  '/src/homeimages/5.jpg',
];

function AutoCarousel() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    let requestId;
    const speed = 1; // px per frame

    function step() {
      if (scrollContainer) {
        scrollAmount += speed;
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestId = requestAnimationFrame(step);
    }
    requestId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(requestId);
  }, []);

  // Duplicate images for infinite effect
  return (
    <div className="w-full overflow-hidden py-8 bg-gray-900">
      <div
        ref={scrollRef}
        className="flex gap-8 w-full overflow-x-scroll scrollbar-hide"
        style={{ scrollBehavior: 'auto', whiteSpace: 'nowrap' }}
      >
        {[...carouselImages, ...carouselImages].map((img, idx) => (
          <div key={idx} className="flex-shrink-0 w-[540px] h-[300px] rounded-xl overflow-hidden shadow-lg bg-gray-900 flex items-center justify-center">
            <img src={img} alt={`carousel-${idx}`} className="object-cover w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const IndexPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <div className="text-center mb-16 pt-16">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Find Your Perfect Job Match
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Connect with top employers and discover opportunities that match your skills and aspirations.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/jobs"
                        className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors flex items-center"
                    >
                        <Briefcase className="mr-2" />
                        Browse Jobs
                    </Link>
                    <Link
                        to="/login"
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <UserPlus className="mr-2" />
                        Get Started
                    </Link>
                </div>
            </div>

            {/* Services Section */}
            <div className="container mx-auto px-4 py-12">
              <h2 className="text-3xl font-bold text-center mb-10">
                AnyHire <span className="text-blue-400">| Find Professionals</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-4 justify-items-center">
                {services.map((service, idx) => (
                  <div key={idx} className="flex flex-col items-center group transition-transform">
                    <div className="relative w-40 h-40 md:w-44 md:h-44 rounded-xl mb-4 transform transition-all duration-300 group-hover:scale-110">
                      {/* Glowing border container */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 animate-neon-glow p-[2px]">
                        {/* Inner content container */}
                        <div className="relative h-full w-full rounded-xl overflow-hidden bg-gray-700">
                          <img 
                            src={service.img} 
                            alt={service.name} 
                            className="object-cover w-full h-full relative z-10" 
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-base md:text-lg text-gray-200 text-center mt-2 group-hover:text-emerald-400 transition-colors duration-300">
                      {service.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Section */}
            <div className="bg-gray-900" style={{marginBottom: '2rem'}}>
              <AutoCarousel />
            </div>

            {/* Feature Image/Text Section */}
            <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 items-center">
              {/* Car Repair Feature */}
              <div className="flex flex-col md:flex-row items-center bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <img src="/src/homeimages/car.jpg" alt="Car Repair" className="w-full md:w-1/2 h-64 object-cover" />
                <div className="p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">Find the Best Automobile Professionals</h3>
                  <p className="text-gray-300 text-lg">Need help with your car? Our platform connects you with top-rated automobile professionals for repairs, maintenance, and diagnostics. Whether it's a quick fix or a major overhaul, find trusted experts to keep your vehicle running smoothly and safely.</p>
                </div>
              </div>
              {/* Plumbing Feature */}
              <div className="flex flex-col md:flex-row items-center bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <img src="/src/homeimages/plum.png" alt="Plumbing" className="w-full md:w-1/2 h-64 object-cover" />
                <div className="p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">Find the Best Plumbing Professionals</h3>
                  <p className="text-gray-300 text-lg">Leaky faucet or major plumbing issue? Discover skilled and reliable plumbers ready to tackle any job, big or small. From installations to emergency repairs, our professionals ensure your plumbing is in top condition, giving you peace of mind at home or work.</p>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 container mx-auto px-4">
                <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
                    <Briefcase className="w-10 h-10 text-emerald-400 mb-3" />
                    <h3 className="text-xl font-semibold mb-3">Find Jobs</h3>
                    <p className="text-gray-400 text-center">
                        Browse through thousands of verified job listings and find the perfect match for your skills.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
                    <UserPlus className="w-10 h-10 text-blue-400 mb-3" />
                    <h3 className="text-xl font-semibold mb-3">Post Jobs</h3>
                    <p className="text-gray-400 text-center">
                        Need help with a project? Post your job and connect with qualified professionals.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
                    <Shield className="w-10 h-10 text-purple-400 mb-3" />
                    <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                    <p className="text-gray-400 text-center">
                        Our secure payment system ensures safe transactions between employers and job seekers.
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-800 rounded-lg p-8 text-center container mx-auto mb-16">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
                <p className="text-gray-300 mb-6">
                    Join thousands of professionals who have already found their dream jobs through our platform.
                </p>
                <Link
                    to="/signupchoice"
                    className="inline-flex items-center bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    Create Your Account
                    <ArrowRight className="ml-2" />
                </Link>
            </div>

            {/* Contact Form Section */}
            <div id="contact" className="mt-16 scroll-mt-24 container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-300">Get in Touch</h2>
                <div className="max-w-2xl mx-auto">
                    <ContactForm />
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-950 text-gray-300 pt-12 pb-6 mt-16">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 pb-8 border-b border-gray-800">
                  <div>
                    <span className="text-2xl font-bold text-white">AnyHire</span>
                    <p className="text-gray-400 mt-2 max-w-xs">Connecting skilled professionals with great opportunities. Your trusted platform for job matching and hiring.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-white">Contact</span>
                    <span className="text-gray-400">Hotline: 076 827 9397</span>
                    <span className="text-gray-400">support@anyhire.com</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-white">Follow Us</span>
                    <div className="flex gap-4 mt-1">
                      <span className="flex items-center gap-2 text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                        <Facebook className="w-5 h-5 text-blue-400" />
                        AnyHire
                      </span>
                      <span className="flex items-center gap-2 text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                        <Instagram className="w-5 h-5 text-pink-400" />
                        AnyHire
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-500 text-sm mt-6">
                  &copy; {new Date().getFullYear()} AnyHire. All rights reserved.
                </div>
              </div>
            </footer>
        </div>
    );
};

export default IndexPage;