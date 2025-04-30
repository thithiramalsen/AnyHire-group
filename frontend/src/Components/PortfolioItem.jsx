const PortfolioItem = ({ item, onEdit, onDelete, categories }) => {
    const categoryNames = item.categories
        .map(categoryId => {
            const category = categories.find(cat => Number(cat._id) === Number(categoryId));
            return category ? category.name : "";
        })
        .filter(name => name !== "")
        .join(", ");

    return (
        <div className="p-4 bg-gray-800 rounded shadow">
            <p>Title: {item.title}</p>
            <p>Phone Number: {item.phoneNumber}</p>
            <p>Email: {item.email}</p>
            <p>Experience: {item.experience}</p>
            <p>Qualifications: {item.qualifications}</p>
            <p>Description: {item.description}</p>
            <p>Categories: {categoryNames}</p>
            <p>Status: {item.status}</p>

            {/* Display Images */}
            {item.images && item.images.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Images:</h3>
                    <div className="flex space-x-2">
                        {item.images.map((image, index) => (
                            <img
                                key={index}
                                src={`http://localhost:5000${image}`}
                                alt={`Portfolio Image ${index + 1}`}
                                className="w-32 h-32 object-cover rounded"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Display Files */}
            {item.files && item.files.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Files:</h3>
                    <ul className="list-disc list-inside">
                        {item.files.map((file, index) => (
                            <li key={index}>
                                <a
                                    href={`http://localhost:5000${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline"
                                >
                                    {`File ${index + 1}`}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-4 flex space-x-2">
                <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default PortfolioItem;