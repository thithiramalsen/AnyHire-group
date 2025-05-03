import { useParams } from 'react-router-dom';
import Chat from '../Components/Chat';

const ChatPage = () => {
    const { bookingId } = useParams();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <Chat bookingId={bookingId} />
            </div>
        </div>
    );
};

export default ChatPage; 