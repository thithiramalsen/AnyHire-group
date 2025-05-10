import { useState } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Phone, 
    Mail, 
    Briefcase, 
    Award, 
    Tag,
    Edit2,
    Trash2
} from 'lucide-react';

const PortfolioItem = ({ item, onEdit, onDelete, categories, showActions = true }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);

    const categoryNames = item.categories
        .map(categoryId => {
            const category = categories.find(cat => Number(cat._id) === Number(categoryId));
            return category ? category.name : "";
        })
        .filter(name => name !== "")
        .join(", ");

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? item.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === item.images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
            {/* Images Carousel */}
            {item.images && item.images.length > 0 && (
                <div className="relative h-48 bg-gray-900 cursor-pointer" onClick={() => setShowImageModal(true)}>
                    <img
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {item.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded text-xs">
                            +{item.images.length - 1} more
                        </div>
                    )}
                </div>
            )}

            <div className="p-6">
                {/* Title and Status */}
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-emerald-400">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                        {item.status}
                    </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <Phone size={16} className="text-emerald-500" />
                        <span>{item.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                        <Mail size={16} className="text-emerald-500" />
                        <span>{item.email}</span>
                    </div>
                </div>

                {/* Experience and Qualifications */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2 text-gray-300">
                        <Briefcase size={16} className="text-emerald-500 mt-1" />
                        <span>{item.experience}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-300">
                        <Award size={16} className="text-emerald-500 mt-1" />
                        <span>{item.qualifications}</span>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4 text-gray-300">
                    <p>{item.description}</p>
                </div>

                {/* Categories */}
                <div className="flex items-center space-x-2 mb-4">
                    <Tag size={16} className="text-emerald-500" />
                    <div className="flex flex-wrap gap-2">
                        {categoryNames.split(", ").map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                                {category}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Files */}
                {item.files && item.files.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Attached Files:</h4>
                        <div className="flex flex-wrap gap-2">
                            {item.files.map((file, index) => (
                                <a
                                    key={index}
                                    href={`http://localhost:5000${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-gray-700 text-emerald-400 rounded-full text-sm hover:bg-gray-600 transition-colors"
                                >
                                    File {index + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons - Only show if showActions is true */}
                {showActions && (
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={onEdit}
                            className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={20} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Image Modal/Slider */}
            {showImageModal && item.images && item.images.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-4 right-4 text-white hover:text-emerald-400"
                    >
                        <X size={32} />
                    </button>
                    
                    <button
                        onClick={handlePrevImage}
                        className="absolute left-4 text-white hover:text-emerald-400"
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <div className="relative max-w-4xl max-h-[80vh] mx-16">
                        <img
                            src={`http://localhost:5000${item.images[currentImageIndex]}`}
                            alt={`Portfolio Image ${currentImageIndex + 1}`}
                            className="max-w-full max-h-[80vh] object-contain rounded"
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded text-white">
                            {currentImageIndex + 1} / {item.images.length}
                        </div>
                    </div>

                    <button
                        onClick={handleNextImage}
                        className="absolute right-4 text-white hover:text-emerald-400"
                    >
                        <ChevronRight size={48} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PortfolioItem;