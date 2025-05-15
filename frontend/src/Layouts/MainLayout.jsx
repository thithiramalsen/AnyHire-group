import Footer from '../Components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden flex flex-col'>
      <div className='flex-1'>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;